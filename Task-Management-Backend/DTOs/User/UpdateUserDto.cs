using System.ComponentModel.DataAnnotations;

namespace StudentAPI.DTOs.User
{
    public class UpdateUserDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        [MinLength(6)]
        public string? Password { get; set; }

    }
}
