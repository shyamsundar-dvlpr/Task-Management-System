using StudentAPI.Models;

namespace StudentAPI.Repositories.Interfaces
{
    public interface ITaskRepository
    {
        Task<TaskItem> AddAsync(TaskItem task);
        Task<List<TaskItem>> GetAllAsync();
        Task<List<TaskItem>> GetByUserIdAsync(int userId);
        Task<TaskItem> GetByIdAsync(int id);
        Task DeleteAsync(int id);
        Task SaveChangesAsync();
        Task<List<TaskItem>> GetPagedAsync(int page, int pageSize, string? search=null);
        Task<int> GetCountAsync(string? search = null);
    }
}
