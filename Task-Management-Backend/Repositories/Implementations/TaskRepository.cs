using Microsoft.EntityFrameworkCore;
using StudentAPI.Data;
using StudentAPI.Models;
using StudentAPI.Repositories.Interfaces;

namespace StudentAPI.Repositories.Implementations
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TaskItem> AddAsync(TaskItem task)
        {
            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }
        public async Task<List<TaskItem>> GetAllAsync()
        {
            return await _context.TaskItems.ToListAsync();
        }
        public async Task<List<TaskItem>> GetByUserIdAsync(int userId)
        {
            return await _context.TaskItems.Where(t => t.AssignedToUserId == userId).ToListAsync();
        }
        public async Task<TaskItem> GetByIdAsync(int id)
        {
            return await _context.TaskItems.FindAsync(id);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public Task DeleteAsync(int id)
        {
            var task = _context.TaskItems.Find(id);
            if (task != null)
            {
                _context.TaskItems.Remove(task);
                return _context.SaveChangesAsync();
            }
            return Task.CompletedTask;
        }
        public async Task<List<TaskItem>> GetPagedAsync(int page, int pageSize, string? search = null)
        {
            var query = _context.TaskItems.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Title.Contains(search));
            return await query
                .OrderBy(t => t.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
        public async Task<int> GetCountAsync(string? search = null)
        {
            var query = _context.TaskItems.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Title.Contains(search));
            return await query.CountAsync();
        }
    }
}
