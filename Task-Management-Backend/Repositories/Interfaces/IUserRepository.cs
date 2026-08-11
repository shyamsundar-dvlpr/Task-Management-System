using StudentAPI.Models;

namespace StudentAPI.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<User> AddAsync(User user);
        Task<List<User>> GetAllAsync();
        Task<User> GetByIdAsync(int id);
        Task<User> DeleteAsync(int id);
        Task<User> UpdateAsync(User user);
        Task<List<User>> GetPagesAsync(int page, int pageSize,string? search=null);
        Task<int> GetCountAsync(string? search = null);

    }
}
