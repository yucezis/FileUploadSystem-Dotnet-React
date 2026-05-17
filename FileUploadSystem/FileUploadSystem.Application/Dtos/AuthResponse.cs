using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileUploadSystem.Application.DTOs.Auth
{
    public record AuthResponse(
        string AccessToken,
        string RefreshToken,
        DateTime AccessTokenExpiry,
        string Email,
        string FullName,
        string Role);
}
