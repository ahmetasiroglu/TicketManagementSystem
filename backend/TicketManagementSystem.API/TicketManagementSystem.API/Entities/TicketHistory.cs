namespace TicketManagementSystem.API.Entities
{
    public class TicketHistory
    {
        public int TicketHistoryId { get; set; }

        public int TicketId { get; set; }
        public Ticket Ticket { get; set; } = null!;

        public int ChangedByUserId { get; set; }
        public User ChangedByUser { get; set; } = null!;

        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? ActionNote { get; set; }

        public DateTime ChangedAt { get; set; }
    }
}