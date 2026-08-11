using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentAPI.DTOs.User;
using StudentAPI.Services.Implementations;
using StudentAPI.Services.Interfaces;

namespace StudentAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await _userService.GetCurrentUserAsync(User.Identity.Name);
            return Ok(user);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(user);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = await _userService.CreateUserAsync(dto);
            return StatusCode(201, user);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task DeleteUser(int id)
        {
            await _userService.DeleteUser(id);
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateForm(int id, [FromBody] UpdateUserDto dto)
        {   
            return Ok(await _userService.UpdateUserAsync(id, dto));
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("role/{role}")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            var users = await _userService.GetUsersByRoleAsync(role);
            return Ok(users);
        }
       
        [Authorize(Roles = "Admin")]
        [HttpGet("pages")]
        public async Task<IActionResult> GetUsersPages([FromQuery] int page = 1, [FromQuery] int pageSize = 5, [FromQuery] string? search = null)
        {
            var users = await _userService.GetUsersPagesAsync(page, pageSize, search);
            return Ok(users);
        }
    }
}
