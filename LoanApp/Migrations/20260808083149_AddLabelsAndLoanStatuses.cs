using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace LoanApp.Migrations
{
    public partial class AddLabelsAndLoanStatuses : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "Statuses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PaymentPlans",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Interests",
                keyColumn: "InterestId",
                keyValue: 2,
                column: "InterestRate",
                value: 13m);

            migrationBuilder.UpdateData(
                table: "PaymentPlans",
                keyColumn: "PaymentPlanId",
                keyValue: 1,
                column: "Name",
                value: "Standard");

            migrationBuilder.UpdateData(
                table: "PaymentPlans",
                keyColumn: "PaymentPlanId",
                keyValue: 2,
                column: "Name",
                value: "Extended");

            migrationBuilder.UpdateData(
                table: "StatusCategories",
                keyColumn: "StatusCategoryId",
                keyValue: 1,
                column: "Code",
                value: "LOAN_APPLICATION_STATUS");

            migrationBuilder.InsertData(
                table: "StatusCategories",
                columns: new[] { "StatusCategoryId", "Code" },
                values: new object[] { 2, "LOAN_STATUS" });

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 1,
                column: "Label",
                value: "Pending Review");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 2,
                column: "Label",
                value: "Pending Approval");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 3,
                column: "Label",
                value: "Pending Release");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 4,
                column: "Label",
                value: "Released");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 5,
                column: "Label",
                value: "Returned by Reviewer");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 6,
                column: "Label",
                value: "Returned by Approver");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 7,
                column: "Label",
                value: "Rejected");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 8,
                column: "Label",
                value: "Cancelled");

            migrationBuilder.UpdateData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 9,
                column: "Label",
                value: "Approved");

            migrationBuilder.InsertData(
                table: "Statuses",
                columns: new[] { "StatusId", "Code", "Label", "StatusCategoryId" },
                values: new object[,]
                {
                    { 10, "ACTIVE", "Active", 2 },
                    { 11, "PAID", "Fully Paid", 2 },
                    { 12, "OVERDUE", "Overdue", 2 },
                    { 13, "DEFAULTED", "Defaulted", 2 }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "StatusCategories",
                keyColumn: "StatusCategoryId",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "Label",
                table: "Statuses");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "PaymentPlans");

            migrationBuilder.UpdateData(
                table: "Interests",
                keyColumn: "InterestId",
                keyValue: 2,
                column: "InterestRate",
                value: 10.1m);

            migrationBuilder.UpdateData(
                table: "StatusCategories",
                keyColumn: "StatusCategoryId",
                keyValue: 1,
                column: "Code",
                value: "LOAN_STATUS");
        }
    }
}
