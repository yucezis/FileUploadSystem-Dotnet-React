using FileUploadSystem.Application.Interfaces;
using FileUploadSystem.Infrastructure;
using FileUploadSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FileUploadSystem.Application.Dtos;

namespace FileUploadSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class DocumentController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ApplicationDbContext _context; 

        public DocumentController(IStorageService storageService, ApplicationDbContext context)
        {
            _storageService = storageService;
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Lütfen bir dosya seçin.");

            try
            {
                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";

                using var stream = file.OpenReadStream();
                var uploadedPath = await _storageService.UploadFileAsync(stream, uniqueFileName, file.ContentType);

                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId))
                    return Unauthorized("Geçersiz kullanıcı kimliği.");

                var documentId = Guid.NewGuid();
                var document = new Domain.Entities.Document
                {
                    Id = documentId,
                    UserId = userId,
                    Name = file.FileName,
                    IsDeleted = false,
                    CreatedDate = DateTime.UtcNow
                };

                var documentVersion = new Domain.Entities.DocumentVersion
                {
                    Id = Guid.NewGuid(),
                    DocumentId = documentId,
                    VersionNumber = 1, 
                    StorageKey = uploadedPath,
                    FileSizeBytes = file.Length,
                    ContentType = file.ContentType,
                    UploadedAt = DateTime.UtcNow
                };

                _context.Documents.Add(document);
                _context.DocumentVersions.Add(documentVersion);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Dosya başarıyla yüklendi!", Path = uploadedPath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
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

                    var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var documentId = Guid.NewGuid();

                    var document = new Domain.Entities.Document
                    {
                        Id = documentId,
                        UserId = Guid.Parse(userIdString!),
                        Name = request.FileName,
                        IsDeleted = false,
                        CreatedDate = DateTime.UtcNow
                    };

                    var documentVersion = new Domain.Entities.DocumentVersion
                    {
                        Id = Guid.NewGuid(),
                        DocumentId = documentId,
                        VersionNumber = 1,
                        StorageKey = finalPath,
                        FileSizeBytes = request.TotalFileSize,
                        ContentType = request.File.ContentType,
                        UploadedAt = DateTime.UtcNow
                    };

                    _context.Documents.Add(document);
                    _context.DocumentVersions.Add(documentVersion);
                    await _context.SaveChangesAsync();

                    return Ok(new { Message = "Tüm parçalar başarıyla birleştirildi ve kaydedildi!", Path = finalPath });
                }

                return Ok(new { Message = $"Parça {request.ChunkIndex}/{request.TotalChunks} başarıyla yüklendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }
    }
}