using Microsoft.AspNetCore.Mvc;
using TicketManagementSystem.API.Models;
using TicketManagementSystem.API.Services;

namespace TicketManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly TokenService _tokenService;

        public AuthController(AuthService authService, TokenService tokenService)
        {
            _authService = authService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.Register(request, 3);

            if (result == null)
                return BadRequest("Bu email zaten kayıtlı");

            return Ok(result);
        }

        [HttpPost("create-moderator")]
        public async Task<IActionResult> CreateModerator(RegisterRequest request)
        {
            var result = await _authService.Register(request, 2);

            if (result == null)
                return BadRequest("Bu email zaten kayıtlı");

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _authService.Login(request.Email, request.Password);

            if (user == null)
                return Unauthorized("Geçersiz email veya şifre");

            var token = _tokenService.CreateToken(user);

            string roleName = user.Role switch
            {
                1 => "Admin",
                2 => "Moderator",
                3 => "User",
                _ => "User"
            };

            return Ok(new
            {
                token,
                user = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                    user.Department,
                    Role = roleName
                }
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _authService.GetUsers();

            return Ok(users.Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.Department,
                u.Role,
                u.CreatedAt
            }));
        }
    }
}