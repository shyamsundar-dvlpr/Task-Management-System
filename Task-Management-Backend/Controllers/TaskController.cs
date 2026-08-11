using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentAPI.DTOs.Task;
using StudentAPI.Services.Interfaces;
using System.Security.Claims;

namespace StudentAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;
        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }
        [Authorize(Roles = "User,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            await _taskService.CreateTaskAsync(dto);
            return StatusCode(201, dto);
        }

        [Authorize(Roles = "User,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetUserTasks()
        {
            var tasks = await _taskService.GetUserTasksAsync(User.Identity.Name);
            return Ok(tasks);
        }

        [Authorize(Roles = "User,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var isAdmin = User.IsInRole("Admin");
            await _taskService.UpdateTaskAsync(id, dto, userId, isAdmin);
            return Ok(dto);
        }
        [Authorize(Roles = "User,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var isAdmin = User.IsInRole("Admin");
            await _taskService.DeleteTaskAsync(id, userId, isAdmin);
            return NoContent();
        }

        [Authorize(Roles = "User,Admin")]
        [HttpGet("pages")]
        public async Task<IActionResult> GetTasksPages([FromQuery] int page = 1, [FromQuery] int pageSize = 5,[FromQuery] string? search = null)
        {
            var pagedResult = await _taskService.GetTasksPagesAsync(page, pageSize, search);
            return Ok(pagedResult);
        }
    }
}
