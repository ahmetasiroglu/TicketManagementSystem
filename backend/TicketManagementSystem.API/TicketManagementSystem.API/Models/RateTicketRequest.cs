namespace TicketManagementSystem.API.Models
{
    public class RateTicketRequest
    {
        public bool IsResolvedApproved { get; set; }
        public int Rating { get; set; }
        public string? FeedbackNote { get; set; }
    }
}