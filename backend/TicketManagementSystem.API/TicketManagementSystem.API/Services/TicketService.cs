using Microsoft.EntityFrameworkCore;
using TicketManagementSystem.API.Data;
using TicketManagementSystem.API.Entities;
using TicketManagementSystem.API.Models;

namespace TicketManagementSystem.API.Services
{
    public class TicketService
    {
        private readonly AppDbContext _context;

        public TicketService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Ticket> CreateTicket(CreateTicketRequest request)
        {
            var priority = await _context.Priorities
                .Include(p => p.Sla)
                .FirstOrDefaultAsync(p => p.PriorityId == request.PriorityId);

            if (priority == null)
                throw new Exception("Priority bulunamadi");

            var createdAt = DateTime.Now;
            var dueDate = createdAt.AddHours(priority.Sla.ResolutionHours);

            var ticket = new Ticket
            {
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                PriorityId = request.PriorityId,
                CreatedByUserId = request.CreatedByUserId,
                Status = "Open",
                CreatedAt = createdAt,
                DueDate = dueDate,
                IsOverdue = false
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await AddHistory(ticket.TicketId, request.CreatedByUserId, null, "Open", "Ticket oluşturuldu");

            return ticket;
        }

        public async Task<List<Ticket>> GetAllTickets()
        {
            return await _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser)
                .ToListAsync();
        }

        public async Task<Ticket?> GetTicketById(int id)
        {
            return await _context.Tickets
                .Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser)
                .FirstOrDefaultAsync(t => t.TicketId == id);
        }

        public async Task<Ticket?> UpdateStatus(int id, string status)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return null;

            var oldStatus = ticket.Status;

            ticket.Status = status;
            ticket.UpdatedAt = DateTime.Now;

            if (status == "Closed")
                ticket.ClosedAt = DateTime.Now;

            if (ticket.DueDate.HasValue && DateTime.Now > ticket.DueDate.Value && status != "Closed")
                ticket.IsOverdue = true;

            await _context.SaveChangesAsync();

            await AddHistory(ticket.TicketId, ticket.CreatedByUserId, oldStatus, status, "Ticket durumu güncellendi");

            return ticket;
        }

        public async Task<Ticket?> AssignTicket(int id, int assignedToUserId)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return null;

            var oldStatus = ticket.Status;

            ticket.AssignedToUserId = assignedToUserId;
            ticket.Status = "Assigned";
            ticket.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            await AddHistory(ticket.TicketId, assignedToUserId, oldStatus, "Assigned", "Ticket personele atandi");

            return ticket;
        }

        public async Task<TicketComment?> AddComment(int ticketId, AddCommentRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return null;

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return null;

            var comment = new TicketComment
            {
                TicketId = ticketId,
                UserId = request.UserId,
                CommentText = request.CommentText,
                CreatedAt = DateTime.Now
            };

            _context.TicketComments.Add(comment);
            await _context.SaveChangesAsync();

            await AddHistory(ticketId, request.UserId, ticket.Status, ticket.Status, "Ticket'a yorum eklendi");

            return comment;
        }

        public async Task<List<TicketComment>> GetCommentsByTicketId(int ticketId)
        {
            return await _context.TicketComments
                .Include(c => c.User)
                .Include(c => c.Ticket)
                .Where(c => c.TicketId == ticketId)
                .ToListAsync();
        }

        private async Task AddHistory(int ticketId, int changedByUserId, string? oldStatus, string? newStatus, string actionNote)
        {
            var history = new TicketHistory
            {
                TicketId = ticketId,
                ChangedByUserId = changedByUserId,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                ActionNote = actionNote,
                ChangedAt = DateTime.Now
            };

            _context.TicketHistories.Add(history);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TicketHistory>> GetHistoryByTicketId(int ticketId)
        {
            return await _context.TicketHistories
                .Include(h => h.ChangedByUser)
                .Where(h => h.TicketId == ticketId)
                .OrderBy(h => h.ChangedAt)
                .ToListAsync();
        }

        public async Task<object> GetDashboard()
        {
            var total = await _context.Tickets.CountAsync();
            var open = await _context.Tickets.CountAsync(t => t.Status == "Open");
            var inProgress = await _context.Tickets.CountAsync(t => t.Status == "InProgress");
            var closed = await _context.Tickets.CountAsync(t => t.Status == "Closed");
            var overdue = await _context.Tickets.CountAsync(t => t.IsOverdue);

            return new
            {
                totalTickets = total,
                openTickets = open,
                inProgressTickets = inProgress,
                closedTickets = closed,
                overdueTickets = overdue
            };
        }

        public async Task<object> GetCategoryStats()
        {
            var result = await _context.Tickets
                .Include(t => t.Category)
                .GroupBy(t => t.Category.CategoryName)
                .Select(g => new
                {
                    category = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<object> GetPriorityStats()
        {
            var result = await _context.Tickets
                .Include(t => t.Priority)
                .GroupBy(t => t.Priority.PriorityName)
                .Select(g => new
                {
                    priority = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<object> GetLast7DaysStats()
        {
            var last7Days = DateTime.Now.AddDays(-7);

            var result = await _context.Tickets
                .Where(t => t.CreatedAt >= last7Days)
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<Ticket?> RateTicket(int ticketId, RateTicketRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);

            if (ticket == null)
                return null;

            ticket.IsResolvedApproved = request.IsResolvedApproved;
            ticket.Rating = request.Rating;
            ticket.FeedbackNote = request.FeedbackNote;
            ticket.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            await AddHistory(
                ticket.TicketId,
                ticket.CreatedByUserId,
                ticket.Status,
                ticket.Status,
                "Kullanici cozum icin geri bildirim verdi"
            );

            return ticket;
        }
    }
}