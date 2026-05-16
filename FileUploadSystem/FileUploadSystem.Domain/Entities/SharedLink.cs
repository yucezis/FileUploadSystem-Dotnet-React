using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileUploadSystem.Domain.Entities
{
    public class SharedLink
    {
        public Guid Id { get; set; }
        public Guid DocumentId { get; set; }
        public Guid Token { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Property
        public Document Document { get; set; }
    }
}
