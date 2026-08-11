using StudentAPI.DTOs.Auth;

namespace StudentAPI.Services.Interfaces
{
    public interface IAuthService
    {
        Task<TokenResponseDto> LoginAsync(LoginDto dto);
        Task<TokenResponseDto> RefreshAsync(string refreshToken);
        Task RevokeAsync(string refreshToken); 
    }
}
