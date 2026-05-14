namespace TicketManagementSystem.API.Entities
{
    public class TicketComment
    {
        public int TicketCommentId { get; set; }

        public int TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string CommentText { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}