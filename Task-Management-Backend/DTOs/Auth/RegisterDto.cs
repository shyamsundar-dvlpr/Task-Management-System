using System.ComponentModel.DataAnnotations;

namespace StudentAPI.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}
