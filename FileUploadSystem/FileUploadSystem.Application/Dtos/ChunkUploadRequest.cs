using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace FileUploadSystem.Application.Dtos
{
    public class ChunkUploadRequest
    {
        public IFormFile File { get; set; } // O anki 5-10 MB'lık parça
        public string FileName { get; set; } 
        public string UploadId { get; set; } 
        public int ChunkIndex { get; set; } // Parçanın sırası 
        public int TotalChunks { get; set; } // Toplam parça sayısı
        public long TotalFileSize { get; set; } // Dosyanın toplam boyutu
    }
}
