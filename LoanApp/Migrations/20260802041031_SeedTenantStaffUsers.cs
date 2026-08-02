using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LoanApp.Migrations
{
    /// <inheritdoc />
    public partial class SeedTenantStaffUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "PasswordHash", "RoleId", "TenantId", "UserName" },
                values: new object[,]
                {
                    { 1, "AQAAAAEAACcQAAAAEKvOGE+ATfpFd9wZ+1zUGOWKFMC2JKkGu+BSKWYXi7oBab2KEJ3KUNkqu/XXq771Zw==", 1, 1, "j.admin" },
                    { 2, "AQAAAAEAACcQAAAAEGE2jfRdx10ZGmYlr1HyuyDS7b++xIoN9M1gYpk/EuHULF3UBIvEJRXA1SnecrTPuA==", 2, 1, "j.reviewer" },
                    { 3, "AQAAAAEAACcQAAAAEGWKLL3uBfsK5IRwUMe1XaTr8nQxfW8T2l1Mppi7g4ZptA6Pl8QWGDIcAiAAKTUQbw==", 3, 1, "j.approver" },
                    { 4, "AQAAAAEAACcQAAAAEDOCUsFtT4h2mZK/Tes9OlJY6wawHkvmeLP7MT1o2M+yYJMkK2P/9VBHX/MXeHj2pA==", 1, 2, "m.admin" },
                    { 5, "AQAAAAEAACcQAAAAEOod2TWAHlBWmZrUZYRtX8NlwBkUW8fa/m8oSHly5P/x56xDJUdL4e8+c3i0T0UCqg==", 2, 2, "m.reviewer" },
                    { 6, "AQAAAAEAACcQAAAAEFcQow6xcED8W1/PSL+OlkhYjqa98PxRE6wyLWHal5VU1GiYJ0bTPu+0ryuHOYqTOQ==", 3, 2, "m.approver" }
                });

            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "AccountId", "Birthdate", "FirstName", "LastName", "MiddleName", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Alo", "Santos", null, 1 },
                    { 2, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Luwi", "Santos", null, 2 },
                    { 3, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ampol", "Santos", null, 3 },
                    { 4, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Alo", "Reyes", null, 4 },
                    { 5, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Luwi", "Reyes", null, 5 },
                    { 6, new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ampol", "Reyes", null, 6 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "AccountId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 6);
        }
    }
}
