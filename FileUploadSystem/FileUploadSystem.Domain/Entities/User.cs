using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileUploadSystem.Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public string FullName { get; private set; }
        public string Email { get; private set; }
        public string PasswordHash { get; private set; }
        public string Role { get; private set; } = "User"; 
        public string? RefreshToken { get; private set; } 
        public DateTime? RefreshTokenExpiry { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public ICollection<Document> Documents { get; private set; } = new List<Document>();


        private User() { }


        public static User Create(string fullName, string email, string passwordHash)
        {
            return new User
            {
                Id = Guid.NewGuid(),
                FullName = fullName,
                Email = email.ToLowerInvariant(),
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };
        }

        public void SetRefreshToken(string token, DateTime expiry)
        {
            RefreshToken = token;
            RefreshTokenExpiry = expiry;
        }
    }
}
