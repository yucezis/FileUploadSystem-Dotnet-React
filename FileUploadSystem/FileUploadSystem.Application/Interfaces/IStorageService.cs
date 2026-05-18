using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileUploadSystem.Application.Interfaces
{
    
        public interface IStorageService
        {
            //Dosyayı alıp depolama alanına yükleyen ana metottur.
            //Buradaki en kritik nokta Stream (Veri Akışı) parametresidir.
            //Dosyayı tek seferde sunucunun RAM'ine yığmak yerine, bir borudan su akıtır gibi doğrudan MinIO'ya aktarır.
            //Bu sayede 100 kişi aynı anda büyük dosya yüklese bile sunucunun RAM'i şişmez ve sistem çökmez.
            Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

            //Bu metot, dosyayı indirmek veya tarayıcıda görüntülemek isteyen bir kullanıcıya geçici şifreli bir indirme linki üretir.
            //Süre dolduğunda o link bir daha asla çalışmaz.
            Task<string> GetPresignedUrlAsync(string fileName, int expiryInMinutes = 60);

            //Kullanıcı sistemden bir belgeyi sildiğinde, o belgenin sunucusundan da fiziksel olarak kalıcı bir şekilde yok edilmesini sağlar.
            Task DeleteFileAsync(string fileName);

            Task<string> UploadChunkAsync(Stream chunkStream, string uploadId, int chunkIndex);
            Task<string> MergeChunksAsync(string uploadId, string fileName, int totalChunks, string contentType);
        }
    
}
