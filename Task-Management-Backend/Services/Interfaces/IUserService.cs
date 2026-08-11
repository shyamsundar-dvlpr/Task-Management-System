using StudentAPI.DTOs.Common;
using StudentAPI.DTOs.User;

namespace StudentAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(int id);
        Task<UserDto> GetCurrentUserAsync(string username);
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
        Task DeleteUser(int id);
        Task<List<UserDto>> GetUsersByRoleAsync(string role);
        Task<PagedResult<UserDto>> GetUsersPagesAsync(int page, int pageSize, string? search = null);
    }
}
