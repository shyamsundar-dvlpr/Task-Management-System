using Microsoft.AspNetCore.Mvc;
using StudentAPI.DTOs.Auth;
using StudentAPI.Models;
using StudentAPI.Services.Implementations;
using StudentAPI.Services.Interfaces;

namespace StudentAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
       
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var tokens = await _authService.LoginAsync(dto);
            return Ok(tokens);

        }
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var tokens = await _authService.RefreshAsync(refreshToken);
            return Ok(tokens);
        }
        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] string refreshToken) { 

       await _authService.RevokeAsync(refreshToken);
     return NoContent();
    }
}
}
