using FileUploadSystem.Application.Interfaces;
using FileUploadSystem.Infrastructure;
using FileUploadSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FileUploadSystem.Application.Dtos;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace FileUploadSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ApplicationDbContext _context;
        private readonly IBackgroundJobClient _backgroundJobClient; 

        public DocumentController(
            IStorageService storageService,
            ApplicationDbContext context,
            IBackgroundJobClient backgroundJobClient)
        {
            _storageService = storageService;
            _context = context;
            _backgroundJobClient = backgroundJobClient;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Lütfen bir dosya seçin.");

            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdString, out Guid userId))
                    return Unauthorized("Geçersiz kullanıcı kimliği.");

                var existingDocument = await _context.Documents
                    .Include(d => d.DocumentVersions)
                    .FirstOrDefaultAsync(d => d.UserId == userId && d.Name == file.FileName && !d.IsDeleted);

                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                using var stream = file.OpenReadStream();
                var uploadedPath = await _storageService.UploadFileAsync(stream, uniqueFileName, file.ContentType);

                Guid currentDocumentId;
                int nextVersionNumber = 1;

                if (existingDocument != null)
                {
                    currentDocumentId = existingDocument.Id;

                    nextVersionNumber = existingDocument.DocumentVersions.Any()
                        ? existingDocument.DocumentVersions.Max(v => v.VersionNumber) + 1
                        : 1;
                }
                else
                {
                    currentDocumentId = Guid.NewGuid();
                    var newDocument = new Domain.Entities.Document
                    {
                        Id = currentDocumentId,
                        UserId = userId,
                        Name = file.FileName,
                        IsDeleted = false,
                        CreatedDate = DateTime.UtcNow
                    };
                    _context.Documents.Add(newDocument);
                }

                var documentVersion = new Domain.Entities.DocumentVersion
                {
                    Id = Guid.NewGuid(),
                    DocumentId = currentDocumentId, 
                    VersionNumber = nextVersionNumber,
                    StorageKey = uploadedPath,
                    FileSizeBytes = file.Length,
                    ContentType = file.ContentType,
                    UploadedAt = DateTime.UtcNow
                };

                _context.DocumentVersions.Add(documentVersion);
                await _context.SaveChangesAsync();

                _backgroundJobClient.Enqueue<IThumbnailJob>(job => job.GenerateThumbnailAsync(uploadedPath, file.ContentType));

                string responseMessage = existingDocument != null
                    ? $"Dosya başarıyla güncellendi (Versiyon {nextVersionNumber})!"
                    : "Dosya başarıyla yüklendi!";

                return Ok(new { Message = responseMessage, Path = uploadedPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserDocuments([FromServices] ApplicationDbContext context)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("Kullanıcı kimliği doğrulanamadı.");

            if (!Guid.TryParse(userIdString, out Guid userGuid))
                return BadRequest("Geçersiz kullanıcı kimliği formatı.");

            var documents = await context.Documents
                .Include(d => d.DocumentVersions)
                .Where(d => d.UserId == userGuid && !d.IsDeleted)
                .OrderByDescending(d => d.DocumentVersions.Max(v => v.UploadedAt))
                .Select(d => new
                {
                    Id = d.Id,
                    Name = d.Name,
                    CreatedDate = d.DocumentVersions.Max(v => v.UploadedAt),
                    Version = d.DocumentVersions.Any() ? d.DocumentVersions.Max(v => v.VersionNumber) : 1
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpPost("chunked-upload")]
        public async Task<IActionResult> UploadChunk([FromForm] ChunkUploadRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("Boş dosya parçası gönderilemez.");

            try
            {
                using var stream = request.File.OpenReadStream();
                await _storageService.UploadChunkAsync(stream, request.UploadId, request.ChunkIndex);

                if (request.ChunkIndex == request.TotalChunks)
                {
                    var uniqueFileName = $"{Guid.NewGuid()}_{request.FileName}";

                    var finalPath = await _storageService.MergeChunksAsync(
                        request.UploadId,
                        uniqueFileName,
                        request.TotalChunks,
                        request.File.ContentType);

                    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    var userId = Guid.Parse(userIdString!);

                    var existingDocument = await _context.Documents
                        .Include(d => d.DocumentVersions)
                        .FirstOrDefaultAsync(d => d.UserId == userId && d.Name == request.FileName && !d.IsDeleted);

                    Guid currentDocumentId;
                    int nextVersionNumber = 1;

                    if (existingDocument != null)
                    {
                        currentDocumentId = existingDocument.Id;
                        nextVersionNumber = existingDocument.DocumentVersions.Any()
                            ? existingDocument.DocumentVersions.Max(v => v.VersionNumber) + 1
                            : 1;
                    }
                    else
                    {
                        currentDocumentId = Guid.NewGuid();
                        var document = new Domain.Entities.Document
                        {
                            Id = currentDocumentId,
                            UserId = userId,
                            Name = request.FileName,
                            IsDeleted = false,
                            CreatedDate = DateTime.UtcNow
                        };
                        _context.Documents.Add(document);
                    }

                    var documentVersion = new Domain.Entities.DocumentVersion
                    {
                        Id = Guid.NewGuid(),
                        DocumentId = currentDocumentId,
                        VersionNumber = nextVersionNumber,
                        StorageKey = finalPath,
                        FileSizeBytes = request.TotalFileSize,
                        ContentType = request.File.ContentType,
                        UploadedAt = DateTime.UtcNow
                    };

                    _context.DocumentVersions.Add(documentVersion);
                    await _context.SaveChangesAsync();

                    _backgroundJobClient.Enqueue<IThumbnailJob>(job => job.GenerateThumbnailAsync(finalPath, request.File.ContentType));

                    string responseMessage = existingDocument != null
                        ? $"Büyük dosya güncellendi (Versiyon {nextVersionNumber})!"
                        : "Büyük dosya başarıyla birleştirildi ve kaydedildi!";

                    return Ok(new { Message = responseMessage, Path = finalPath });
                }

                return Ok(new { Message = $"Parça {request.ChunkIndex}/{request.TotalChunks} başarıyla yüklendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }

        [HttpGet("download/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadFile(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out Guid userId))
                return Unauthorized("Geçersiz kullanıcı kimliği.");

            var document = await _context.Documents
                .Include(d => d.DocumentVersions) 
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId && !d.IsDeleted);

            if (document == null)
                return NotFound("Dosya bulunamadı veya erişim yetkiniz yok.");

            var latestVersion = document.DocumentVersions.OrderByDescending(v => v.VersionNumber).FirstOrDefault();
            if (latestVersion == null)
                return NotFound("Dosyanın içeriğine ulaşılamadı.");

            try
            {
                var fileStream = await _storageService.DownloadFileAsync(latestVersion.StorageKey);

                return File(fileStream, latestVersion.ContentType, document.Name);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya MinIO'dan çekilirken hata oluştu: {ex.Message}");
            }
        }
    }
}