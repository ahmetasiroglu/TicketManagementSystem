namespace TicketManagementSystem.API.Models
{
    public class CreateTicketRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int CategoryId { get; set; }
        public int PriorityId { get; set; }
        public int CreatedByUserId { get; set; }
    }
}