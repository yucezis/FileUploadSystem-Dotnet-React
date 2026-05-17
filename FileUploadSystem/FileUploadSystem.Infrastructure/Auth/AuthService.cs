using FileUploadSystem.Application.DTOs.Auth;
using FileUploadSystem.Application.Interfaces;
using FileUploadSystem.Application.Settings;
using FileUploadSystem.Domain.Entities;
using Microsoft.Extensions.Options;

namespace FileUploadSystem.Infrastructure.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwtGenerator;
        private readonly JwtSettings _settings;

        public AuthService(IUserRepository userRepository, IJwtTokenGenerator jwtGenerator, IOptions<JwtSettings> options)
        {
            _userRepository = userRepository;
            _jwtGenerator = jwtGenerator;
            _settings = options.Value;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                throw new Exception("Bu e-posta adresi zaten kullanılıyor.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = User.Create(request.FullName, request.Email, passwordHash);

            await _userRepository.AddAsync(user);

            return await CreateTokenResponseAsync(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Geçersiz e-posta veya şifre.");

            return await CreateTokenResponseAsync(user);
        }

        public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                throw new Exception("Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.");

            return await CreateTokenResponseAsync(user);
        }

        private async Task<AuthResponse> CreateTokenResponseAsync(User user)
        {
            var accessToken = _jwtGenerator.GenerateAccessToken(user);
            var refreshToken = _jwtGenerator.GenerateRefreshToken();
            var expiry = DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes);

            user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays));
            await _userRepository.UpdateAsync(user);

            return new AuthResponse(accessToken, refreshToken, expiry, user.Email, user.FullName, user.Role);
        }
    }
}