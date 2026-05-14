namespace TicketManagementSystem.API.Entities
{
    public class Sla
    {
        public int SlaId { get; set; }
        public int ResponseHours { get; set; }
        public int ResolutionHours { get; set; }
    }
}