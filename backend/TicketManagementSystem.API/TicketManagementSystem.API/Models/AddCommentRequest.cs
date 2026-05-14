namespace TicketManagementSystem.API.Models
{
    public class AddCommentRequest
    {
        public int UserId { get; set; }
        public string CommentText { get; set; } = null!;
    }
}