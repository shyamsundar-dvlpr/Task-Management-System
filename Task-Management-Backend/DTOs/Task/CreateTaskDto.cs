using System.ComponentModel.DataAnnotations;

namespace StudentAPI.DTOs.Task
{
    public class CreateTaskDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public int AssignedUserId { get; set; }
        [Required]
        public string Priority { get; set; } = "Low";

        public DateTime? DueDate { get; set; }
    }
}
