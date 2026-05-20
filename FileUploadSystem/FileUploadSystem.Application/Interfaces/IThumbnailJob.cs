using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileUploadSystem.Application.Interfaces
{
    public interface IThumbnailJob
    {
        Task GenerateThumbnailAsync(string storageKey, string contentType);
    }
}
