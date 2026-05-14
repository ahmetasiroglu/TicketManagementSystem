namespace TicketManagementSystem.API.Models
{
    public class RegisterRequest
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Department { get; set; } = null!;
    }
}