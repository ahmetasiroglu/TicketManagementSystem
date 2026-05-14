using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TicketManagementSystem.API.Models;
using TicketManagementSystem.API.Services;

namespace TicketManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketController : ControllerBase
    {
        private readonly TicketService _ticketService;

        public TicketController(TicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket(CreateTicketRequest request)
        {
            var result = await _ticketService.CreateTicket(request);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var result = await _ticketService.GetAllTickets();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicketById(int id)
        {
            var result = await _ticketService.GetTicketById(id);

            if (result == null)
                return NotFound("Ticket bulunamadi");

            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusRequest request)
        {
            var userIdText = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdText))
                return Unauthorized("Kullanıcı bilgisi alınamadı");

            var currentUserId = int.Parse(userIdText);

            await _ticketService.AssignTicket(id, currentUserId);

            var result = await _ticketService.UpdateStatus(id, request.Status);

            if (result == null)
                return NotFound("Ticket bulunamadi");

            return Ok(result);
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignTicket(int id, AssignTicketRequest request)
        {
            var result = await _ticketService.AssignTicket(id, request.AssignedToUserId);

            if (result == null)
                return NotFound("Ticket bulunamadi");

            return Ok(result);
        }

        [HttpPost("{ticketId}/comments")]
        public async Task<IActionResult> AddComment(int ticketId, AddCommentRequest request)
        {
            var result = await _ticketService.AddComment(ticketId, request);

            if (result == null)
                return NotFound("Ticket veya kullanıcı bulunamadi");

            return Ok(result);
        }

        [HttpGet("{ticketId}/comments")]
        public async Task<IActionResult> GetCommentsByTicketId(int ticketId)
        {
            var result = await _ticketService.GetCommentsByTicketId(ticketId);
            return Ok(result);
        }

        [HttpGet("{ticketId}/history")]
        public async Task<IActionResult> GetHistoryByTicketId(int ticketId)
        {
            var result = await _ticketService.GetHistoryByTicketId(ticketId);
            return Ok(result);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _ticketService.GetDashboard();
            return Ok(result);
        }

        [HttpGet("stats/category")]
        public async Task<IActionResult> GetCategoryStats()
        {
            var result = await _ticketService.GetCategoryStats();
            return Ok(result);
        }

        [HttpGet("stats/priority")]
        public async Task<IActionResult> GetPriorityStats()
        {
            var result = await _ticketService.GetPriorityStats();
            return Ok(result);
        }

        [HttpGet("stats/last7days")]
        public async Task<IActionResult> GetLast7DaysStats()
        {
            var result = await _ticketService.GetLast7DaysStats();
            return Ok(result);
        }

        [HttpPut("{ticketId}/rate")]
        public async Task<IActionResult> RateTicket(int ticketId, RateTicketRequest request)
        {
            var result = await _ticketService.RateTicket(ticketId, request);

            if (result == null)
                return NotFound("Ticket bulunamadi");

            return Ok(result);
        }
    }
}