using Microsoft.Identity.Client;
using StudentAPI.DTOs.Common;
using StudentAPI.DTOs.Task;
using StudentAPI.Exceptions;
using StudentAPI.Models;
using StudentAPI.Repositories.Interfaces;
using StudentAPI.Services.Interfaces;

namespace StudentAPI.Services.Implementations
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<TaskService> _logger;

        public TaskService(ITaskRepository taskRepository, IUserRepository userRepository, ILogger<TaskService> logger)
        {
            _taskRepository = taskRepository;
            _userRepository = userRepository;
            _logger = logger;
        }
        public async Task CreateTaskAsync(CreateTaskDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                AssignedToUserId = dto.AssignedUserId,
                Status = "Pending"
            };
            await _taskRepository.AddAsync(task);
            _logger.LogInformation("Task '{Title}' created and assigned to user {AssignedUserId}", dto.Title, dto.AssignedUserId);
        }
        public async Task<List<TaskDto>> GetAllTasksAsync()
        {
            var tasks = await _taskRepository.GetAllAsync();

            return tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                AssignedUserId = t.AssignedToUserId,
                Status = t.Status
            }).ToList();
        }
        public async Task<List<TaskDto>> GetUserTasksAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);

            var tasks = await _taskRepository.GetByUserIdAsync(user.Id);

            return tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                AssignedUserId = t.AssignedToUserId,
                Status = t.Status
            }).ToList();
        }
        public async Task UpdateTaskAsync(int taskId, UpdateTaskDto dto, int userId, bool isAdmin)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new NotFoundException($"Task with id {taskId} was not found.");
            if (!isAdmin && task.AssignedToUserId != userId)
            {
                _logger.LogWarning("User {UserId} attempted to update task {TaskId} they do not own", userId, taskId);
                throw new UnauthorizedException("You can only update your own tasks.");
            }
            task.Status = dto.Status;
            if(dto.Title != null) task.Title = dto.Title;
            if(dto.Description != null) task.Description = dto.Description;
            if(dto.AssignedUserId != null) task.AssignedToUserId = dto.AssignedUserId.Value;
            if(dto.Priority != null) task.Priority = Enum.Parse<TaskPriority>(dto.Priority, ignoreCase: true);
            if (dto.DueDate != null) task.DueDate = dto.DueDate.Value;
            await _taskRepository.SaveChangesAsync();
            _logger.LogInformation("Task {TaskId} updated by user {UserId}", taskId, userId);
        }
        public async Task DeleteTaskAsync(int id, int userId, bool isAdmin)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null)
                throw new NotFoundException("Task not found");
            if (!isAdmin && task.AssignedToUserId != userId)
            {
                _logger.LogWarning("User {UserId} attempted to delete task {TaskId} they do not own", userId, id);
                throw new UnauthorizedException("You can only delete your own tasks.");
            }
            await _taskRepository.DeleteAsync(id);
            _logger.LogInformation("Task {TaskId} deleted by user {UserId}", id, userId);
        }

        public async Task<PagedResult<TaskDto>> GetTasksPagesAsync(int page, int pageSize, string? search = null)
        {
            var itemsTask = _taskRepository.GetPagedAsync(page, pageSize, search);
            var countTask = _taskRepository.GetCountAsync(search);

            await Task.WhenAll(itemsTask, countTask);

            var items = itemsTask.Result.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                AssignedUserId = t.AssignedToUserId,
                Status = t.Status
            }).ToList();

            return new PagedResult<TaskDto>
            {
                Items = items,
                Total = countTask.Result
            };
        }
       
    }
}

