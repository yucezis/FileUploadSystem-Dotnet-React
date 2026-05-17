using FileUploadSystem.Application.Interfaces;
using FileUploadSystem.Infrastructure.Interface;
using FileUploadSystem.Infrastructure;
using FileUploadSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
    }
}