using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//Bu tablo MinIO'daki fiziksel dosyayı temsil etmez.
//Sadece dosyanın adını ve kime ait olduğunu tutan mantıksal bir klasördür.

namespace FileUploadSystem.Domain.Entities
{
    public class Document
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public User User { get; set; }

        public ICollection<DocumentVersion> DocumentVersions { get; set; }
        public ICollection<SharedLink> SharedLinks { get; set; }
    }
}
