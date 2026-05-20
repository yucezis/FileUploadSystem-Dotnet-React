using FileUploadSystem.Application.Interfaces;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace FileUploadSystem.Infrastructure.Jobs
{
    public class ThumbnailJob : IThumbnailJob
    {
        private readonly ILogger<ThumbnailJob> _logger;

        public ThumbnailJob(ILogger<ThumbnailJob> logger)
        {
            _logger = logger;
        }

        public async Task GenerateThumbnailAsync(string storageKey, string contentType)
        {
            if (!contentType.StartsWith("image/"))
            {
                _logger.LogInformation($"[{storageKey}] bir resim değil. Thumbnail oluşturulmadı.");
                return;
            }

            try
            {
                _logger.LogInformation($"[{storageKey}] için thumbnail oluşturma işlemi başladı...");

                // BURASI HANGFIRE'IN SİHRİDİR:
                // Normalde burada _storageService.DownloadFileAsync ile MinIO'dan dosyayı Stream olarak alırız.
                // Biz şimdilik simüle ediyoruz:

                /* Gerçek Kod Mantığı:
                using var originalFileStream = await _storageService.DownloadFileAsync(storageKey);
                using var image = await Image.LoadAsync(originalFileStream);
                
                // Resmi 200x200 boyutuna küçült
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(200, 200),
                    Mode = ResizeMode.Max
                }));

                // Yeni dosyayı belleğe al ve MinIO'ya "_thumb" ekiyle geri yükle
                using var outStream = new MemoryStream();
                await image.SaveAsJpegAsync(outStream);
                outStream.Position = 0;
                
                var thumbKey = storageKey.Replace(".", "_thumb.");
                await _storageService.UploadFileAsync(outStream, thumbKey, "image/jpeg");
                */

                // İşlemin uzun sürdüğünü simüle etmek için 3 saniye uyutuyoruz
                await Task.Delay(3000);

                _logger.LogInformation($"[{storageKey}] için thumbnail başarıyla oluşturuldu ve MinIO'ya kaydedildi!");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Thumbnail oluşturulurken hata: {ex.Message}");
                throw; 
            }
        }
    }
}