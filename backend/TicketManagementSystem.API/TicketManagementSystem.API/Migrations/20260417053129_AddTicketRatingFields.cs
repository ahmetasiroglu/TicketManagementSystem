using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketManagementSystem.API.Migrations
{

    public partial class AddTicketRatingFields : Migration
    {
     
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsResolvedApproved",
                table: "Tickets",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Tickets",
                type: "int",
                nullable: true);
        }

    
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsResolvedApproved",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Tickets");
        }
    }
}
