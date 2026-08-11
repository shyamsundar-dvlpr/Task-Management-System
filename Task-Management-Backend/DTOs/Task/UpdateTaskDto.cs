using System.ComponentModel.DataAnnotations;
namespace StudentAPI.DTOs.Task
{
    public class UpdateTaskDto
    {
        [Required]
        public string Status { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public int? AssignedUserId { get; set; }

        public string? Priority { get; set; }

        public DateTime? DueDate { get; set; }
    }
}
