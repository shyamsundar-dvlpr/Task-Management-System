using StudentAPI.DTOs.Common;
using StudentAPI.DTOs.Task;

namespace StudentAPI.Services.Interfaces
{
    public interface ITaskService
    {
        Task CreateTaskAsync(CreateTaskDto dto);
        Task<List<TaskDto>> GetAllTasksAsync();
        Task<List<TaskDto>> GetUserTasksAsync(string username);
        Task UpdateTaskAsync(int taskId, UpdateTaskDto dto, int userId,bool isAdmin);
        Task DeleteTaskAsync(int id, int userId, bool isAdmin);
        Task<PagedResult<TaskDto>> GetTasksPagesAsync(int page, int pageSize, string? search = null);
    }
}
