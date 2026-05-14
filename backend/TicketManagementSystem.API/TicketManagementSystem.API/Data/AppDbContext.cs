using Microsoft.EntityFrameworkCore;
using TicketManagementSystem.API.Entities;

namespace TicketManagementSystem.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Sla> Slas { get; set; }
        public DbSet<Priority> Priorities { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<TicketHistory> TicketHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.CreatedByUser)
                .WithMany()
                .HasForeignKey(t => t.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.AssignedToUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TicketComment>()
                .HasOne(tc => tc.Ticket)
                .WithMany()
                .HasForeignKey(tc => tc.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TicketComment>()
                .HasOne(tc => tc.User)
                .WithMany()
                .HasForeignKey(tc => tc.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TicketHistory>()
                .HasOne(th => th.Ticket)
                .WithMany()
                .HasForeignKey(th => th.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TicketHistory>()
                .HasOne(th => th.ChangedByUser)
                .WithMany()
                .HasForeignKey(th => th.ChangedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany()
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany()
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Priority>()
                .HasOne(p => p.Sla)
                .WithMany()
                .HasForeignKey(p => p.SlaId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, RoleName = "Admin" },
                new Role { RoleId = 2, RoleName = "Personel" },
                new Role { RoleId = 3, RoleName = "Kullanici" },
                new Role { RoleId = 4, RoleName = "Yonetici" }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, CategoryName = "Teknik Destek", Description = "Teknik destek talepleri" },
                new Category { CategoryId = 2, CategoryName = "Sikayet", Description = "Sikayet kayitlari" },
                new Category { CategoryId = 3, CategoryName = "Talep", Description = "Genel talepler" }
            );

            modelBuilder.Entity<Sla>().HasData(
                new Sla { SlaId = 1, ResponseHours = 2, ResolutionHours = 24 },
                new Sla { SlaId = 2, ResponseHours = 4, ResolutionHours = 48 },
                new Sla { SlaId = 3, ResponseHours = 8, ResolutionHours = 72 }
            );

            modelBuilder.Entity<Priority>().HasData(
                new Priority { PriorityId = 1, PriorityName = "Dusuk", SlaId = 3 },
                new Priority { PriorityId = 2, PriorityName = "Orta", SlaId = 2 },
                new Priority { PriorityId = 3, PriorityName = "Yuksek", SlaId = 1 }
            );
        }
    }
}