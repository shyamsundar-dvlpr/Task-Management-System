namespace StudentAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int AssignedToUserId { get; set; }

        public string AssignedTo { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public TaskPriority Priority { get; set; } = TaskPriority.Low;

        public DateTime? DueDate { get; set; }

        public DateTime CreatedAt { get; set; } 

        public DateTime UpdatedAt { get; set; }

    }
}
