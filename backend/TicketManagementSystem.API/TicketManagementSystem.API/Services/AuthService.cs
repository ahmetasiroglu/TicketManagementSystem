using Microsoft.EntityFrameworkCore;
using TicketManagementSystem.API.Data;
using TicketManagementSystem.API.Entities;
using TicketManagementSystem.API.Models;

namespace TicketManagementSystem.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> Login(string email, string password)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Email == email && x.PasswordHash == password);
        }

        public async Task<User?> Register(RegisterRequest request, int role = 3)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            if (existingUser != null)
                return null;

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = request.Password,
                Department = request.Department,
                IsActive = true,
                CreatedAt = DateTime.Now,
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<List<User>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }
    }
}