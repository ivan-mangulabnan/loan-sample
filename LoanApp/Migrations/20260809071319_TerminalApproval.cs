using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanApp.Migrations
{
    /// <inheritdoc />
    public partial class TerminalApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LoanApprovals_LoanApplicationId",
                table: "LoanApprovals");

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 6);

            migrationBuilder.CreateIndex(
                name: "IX_LoanApprovals_LoanApplicationId",
                table: "LoanApprovals",
                column: "LoanApplicationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LoanApprovals_LoanApplicationId",
                table: "LoanApprovals");

            migrationBuilder.InsertData(
                table: "Statuses",
                columns: new[] { "StatusId", "Code", "Label", "StatusCategoryId" },
                values: new object[] { 6, "RETURNED_BY_APPROVER", "Returned by Approver", 1 });

            migrationBuilder.CreateIndex(
                name: "IX_LoanApprovals_LoanApplicationId",
                table: "LoanApprovals",
                column: "LoanApplicationId");
        }
    }
}
