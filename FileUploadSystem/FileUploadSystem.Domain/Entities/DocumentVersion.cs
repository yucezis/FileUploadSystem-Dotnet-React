using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//MinIO'ya yüklenen gerçek parçalar burada tutulur.
//Aynı OriginalName ile yeni bir dosya yüklendiğinde
//Document tablosu değişmez, sadece bu tabloya VersionNumber artırılarak yeni bir satır eklenir.

namespace FileUploadSystem.Domain.Entities
{
    public class DocumentVersion
    {
        public Guid Id { get; set; }
        public Guid DocumentId { get; set; } 
        public int VersionNumber { get; set; } 
        public string StorageKey { get; set; } 
        public long FileSizeBytes { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadedAt { get; set; }

        public Document Document { get; set; }
    }
}
