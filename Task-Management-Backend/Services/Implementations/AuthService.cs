using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using StudentAPI.Data;
using StudentAPI.DTOs.Auth;
using StudentAPI.Exceptions;
using StudentAPI.Helpers;
using StudentAPI.Models;
using StudentAPI.Repositories.Interfaces;
using StudentAPI.Services.Interfaces;

namespace StudentAPI.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher _hasher;
        private readonly JwtHelper _jwtHelper;
        private readonly AppDbContext _context;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUserRepository userRepository, PasswordHasher hasher , JwtHelper jwtHelper, AppDbContext context, ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _hasher = hasher;
            _jwtHelper = jwtHelper;
            _context = context;
            _logger = logger;
        }
        public async Task RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);

            if (existingUser != null)
            {
                throw new BadHttpRequestException("User already exists");
            }

            var user = new User
            {
                Name = dto.Username,
                PasswordHash = _hasher.Hash(dto.Password),
                Role = "User"
            };

            await _userRepository.AddAsync(user);
            _logger.LogInformation("New User registered: {Username} with role {Role}", dto.Username, "User");
        }
        public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByUsernameAsync(dto.Username);
            if (user == null || !_hasher.Verify(user.PasswordHash, dto.Password))
            {
                _logger.LogWarning("Failed login attempt for username {Username}", dto.Username);
                throw new BadHttpRequestException("Invalid username or password");
            }
            var accessToken = _jwtHelper.GenerateToken(user);
            var refreshTokenValue = JwtHelper.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Token = refreshTokenValue,
                userId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            _logger.LogInformation("User {Username} (Id: {UserId}) logged in successfully", user.Name, user.Id);
            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenValue,
            };
        }

        public async Task<TokenResponseDto> RefreshAsync(string refreshToken)
        {
            var stored = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored == null || stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
                throw new UnauthorizedException("Refresh token is invalid or expired.");

            stored.IsRevoked = true;

            var newAccessToken = _jwtHelper.GenerateToken(stored.User);
            var newRefreshTokenValue = JwtHelper.GenerateRefreshToken();

            _context.RefreshTokens.Add(new RefreshToken
            {
                Token = newRefreshTokenValue,
                userId = stored.userId,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            });
            await _context.SaveChangesAsync();
            return new TokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshTokenValue,
            };
        }

        public async Task RevokeAsync(string refreshToken)
        {
            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == refreshToken);

            if (stored != null)
            {
                stored.IsRevoked = true;
                await _context.SaveChangesAsync();
            }
        } 
    }
}
