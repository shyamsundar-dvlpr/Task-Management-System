using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StudentAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveInvalidSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "admin", "AQAAAAIAAYagAAAAELPjK5LJvP6EvZAHZ4wrqJnHmXc4gYKHb6ELZqZTJwRARTCh8ZLZQhQRZE7nK1GXAQ==", "Admin" },
                    { 2, "user", "AQAAAAIAAYagAAAAEH1d8M6hZ5sGfFzF9+K/nSh5rFXmKLQ+xF5FQr9G3a6AJSP+8sHZNLhQE4a+RVGK6A==", "User" }
                });
        }
    }
}
