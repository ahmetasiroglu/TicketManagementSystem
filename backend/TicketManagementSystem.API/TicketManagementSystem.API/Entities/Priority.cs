namespace TicketManagementSystem.API.Entities
{
    public class Priority
    {
        public int PriorityId { get; set; }
        public string PriorityName { get; set; } = null!;

        public int SlaId { get; set; }
        public Sla Sla { get; set; } = null!;
    }
}