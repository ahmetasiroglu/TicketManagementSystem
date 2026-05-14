using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TicketManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("Bu herkese açık endpoint");
        }

        [Authorize]
        [HttpGet("private")]
        public IActionResult Private()
        {
            return Ok("Bu sadece token ile girilen endpoint");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnly()
        {
            return Ok("Bu endpoint sadece admin içindir");
        }

        [Authorize(Roles = "Kullanici")]
        [HttpGet("user-only")]
        public IActionResult UserOnly()
        {
            return Ok("Bu endpoint sadece kullanici rolü içindir");
        }
    }
}