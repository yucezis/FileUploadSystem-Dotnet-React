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
                .WithSSL(false)
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
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{uploadId}.tmp");

            using (var fileStream = new FileStream(tempFilePath, FileMode.Append, FileAccess.Write, FileShare.None))
            {
                await chunkStream.CopyToAsync(fileStream);
            }

            return tempFilePath;
        }

        public async Task<string> MergeChunksAsync(string uploadId, string fileName, int totalChunks, string contentType)
        {
            var finalPath = $"uploads/{fileName}";
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{uploadId}.tmp");

            if (!File.Exists(tempFilePath))
                throw new Exception("Birleştirilecek dosya bulunamadı.");

            using (var fileStream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read))
            {
                var putObjectArgs = new PutObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(finalPath)
                    .WithStreamData(fileStream)
                    .WithObjectSize(fileStream.Length)
                    .WithContentType(contentType);

                await _minioClient.PutObjectAsync(putObjectArgs);
            }

            File.Delete(tempFilePath);

            return finalPath;
        }
    }
}