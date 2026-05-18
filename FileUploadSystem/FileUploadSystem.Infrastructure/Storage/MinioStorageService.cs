using FileUploadSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;

namespace FileUploadSystem.Infrastructure.Storage
{
    public class MinioStorageService : IStorageService
    {
        private readonly IMinioClient _minioClient;
        private readonly string _bucketName;

        public MinioStorageService(IConfiguration configuration)
        {
            _bucketName = configuration["MinIO:BucketName"] ?? "documents";

            _minioClient = new MinioClient()
                .WithEndpoint(configuration["MinIO:Endpoint"])
                .WithCredentials(configuration["MinIO:AccessKey"], configuration["MinIO:SecretKey"])
                .Build();
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            bool found = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucketName));
            if (!found)
            {
                await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucketName));
            }

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);

            return fileName;
        }

        public Task DeleteFileAsync(string fileName)
        {
            throw new NotImplementedException(); 
        }

        public Task<string> GetPresignedUrlAsync(string fileName, int expiryInMinutes = 60)
        {
            throw new NotImplementedException(); 
        }

        public async Task<string> UploadChunkAsync(Stream chunkStream, string uploadId, int chunkIndex)
        {
            // Her parçayı "temp/{uploadId}/part_{chunkIndex}" isimli geçici bir yola kaydediyoruz
            var chunkName = $"temp/{uploadId}/part_{chunkIndex}";

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(chunkName)
                .WithStreamData(chunkStream)
                .WithObjectSize(chunkStream.Length);

            await _minioClient.PutObjectAsync(putObjectArgs);
            return chunkName;
        }

        public async Task<string> MergeChunksAsync(string uploadId, string fileName, int totalChunks, string contentType)
        {
            var finalPath = $"uploads/{fileName}";
            var sourceArgs = new List<ComposeSourceArgs>();

            // Yüklenen tüm parçaların yollarını sırasıyla listeye ekliyoruz
            for (int i = 1; i <= totalChunks; i++)
            {
                sourceArgs.Add(new ComposeSourceArgs()
                    .WithBucket(_bucketName)
                    .WithObject($"temp/{uploadId}/part_{i}"));
            }

            // MinIO'ya "Bu kaynak parçaları al ve finalPath altında birleştir" emri veriyoruz
            var composeArgs = new ComposeObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(finalPath)
                .WithSources(sourceArgs);

            await _minioClient.ComposeObjectAsync(composeArgs);

            // Temizlik: Birleştirme bitince MinIO'daki geçici (temp) parçaları siliyoruz
            for (int i = 1; i <= totalChunks; i++)
            {
                await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject($"temp/{uploadId}/part_{i}"));
            }

            return finalPath;
        }
    }
}