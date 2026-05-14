namespace TicketManagementSystem.API.Entities
{
    public class Ticket
    {
        public int TicketId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Status { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public int PriorityId { get; set; }
        public Priority Priority { get; set; } = null!;

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        public int? AssignedToUserId { get; set; }
        public User? AssignedToUser { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ClosedAt { get; set; }
        public bool IsOverdue { get; set; }

        public bool? IsResolvedApproved { get; set; }
        public int? Rating { get; set; }
        public string? FeedbackNote { get; set; }
    }
}