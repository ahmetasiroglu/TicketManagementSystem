using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace TicketManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "CategoryName", "Description" },
                values: new object[,]
                {
                    { 1, "Teknik Destek", "Teknik destek talepleri" },
                    { 2, "Sikayet", "Sikayet kayitlari" },
                    { 3, "Talep", "Genel talepler" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleId", "RoleName" },
                values: new object[,]
                {
                    { 1, "Admin" },
                    { 2, "Personel" },
                    { 3, "Kullanici" },
                    { 4, "Yonetici" }
                });

            migrationBuilder.InsertData(
                table: "Slas",
                columns: new[] { "SlaId", "ResolutionHours", "ResponseHours" },
                values: new object[,]
                {
                    { 1, 24, 2 },
                    { 2, 48, 4 },
                    { 3, 72, 8 }
                });

            migrationBuilder.InsertData(
                table: "Priorities",
                columns: new[] { "PriorityId", "PriorityName", "SlaId" },
                values: new object[,]
                {
                    { 1, "Dusuk", 3 },
                    { 2, "Orta", 2 },
                    { 3, "Yuksek", 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Priorities",
                keyColumn: "PriorityId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Priorities",
                keyColumn: "PriorityId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Priorities",
                keyColumn: "PriorityId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Slas",
                keyColumn: "SlaId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Slas",
                keyColumn: "SlaId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Slas",
                keyColumn: "SlaId",
                keyValue: 3);
        }
    }
}
