using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace LoanApp.Migrations
{
    public partial class ApprovalWorkflowAndLedger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanApprovals_ReviewApplications_ReviewApplicationId",
                table: "LoanApprovals");

            migrationBuilder.RenameColumn(
                name: "ReviewApplicationId",
                table: "LoanApprovals",
                newName: "LoanApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_LoanApprovals_ReviewApplicationId",
                table: "LoanApprovals",
                newName: "IX_LoanApprovals_LoanApplicationId");

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "FundReleases",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleaseDate",
                table: "FundReleases",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.InsertData(
                table: "Interests",
                columns: new[] { "InterestId", "InterestRate" },
                values: new object[,]
                {
                    { 1, 5.5m },
                    { 2, 10.1m }
                });

            migrationBuilder.InsertData(
                table: "Ledgers",
                columns: new[] { "LedgerId", "CurrentBalance", "Name", "TenantId" },
                values: new object[,]
                {
                    { 1, 0m, "Jitsu Finance Operating", 1 },
                    { 2, 0m, "Mejia Finance Operating", 2 }
                });

            migrationBuilder.InsertData(
                table: "StatusCategories",
                columns: new[] { "StatusCategoryId", "Code" },
                values: new object[] { 1, "LOAN_STATUS" });

            migrationBuilder.InsertData(
                table: "TransactionTypes",
                columns: new[] { "TransactionTypeId", "Code", "Label" },
                values: new object[,]
                {
                    { 1, "CAPITAL_DEPOSIT", "Capital Deposit" },
                    { 2, "CORRECTION", "Correction" },
                    { 3, "FUND_RELEASE", "Fund Release" },
                    { 4, "PAYMENT", "Payment" }
                });

            migrationBuilder.InsertData(
                table: "PaymentPlans",
                columns: new[] { "PaymentPlanId", "InterestId", "NumberOfMonths" },
                values: new object[,]
                {
                    { 1, 1, 2 },
                    { 2, 2, 4 }
                });

            migrationBuilder.InsertData(
                table: "Statuses",
                columns: new[] { "StatusId", "Code", "StatusCategoryId" },
                values: new object[,]
                {
                    { 1, "DRAFT", 1 },
                    { 2, "PENDING_REVIEW", 1 },
                    { 3, "PENDING_APPROVAL", 1 },
                    { 4, "PENDING_RELEASE", 1 },
                    { 5, "RELEASED", 1 },
                    { 6, "RETURNED_BY_REVIEWER", 1 },
                    { 7, "RETURNED_BY_APPROVER", 1 },
                    { 8, "REJECTED", 1 },
                    { 9, "CANCELLED", 1 },
                    { 10, "APPROVED", 1 }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_LoanApprovals_LoanApplications_LoanApplicationId",
                table: "LoanApprovals",
                column: "LoanApplicationId",
                principalTable: "LoanApplications",
                principalColumn: "LoanApplicationId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanApprovals_LoanApplications_LoanApplicationId",
                table: "LoanApprovals");

            migrationBuilder.DeleteData(
                table: "Ledgers",
                keyColumn: "LedgerId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Ledgers",
                keyColumn: "LedgerId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PaymentPlans",
                keyColumn: "PaymentPlanId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PaymentPlans",
                keyColumn: "PaymentPlanId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Statuses",
                keyColumn: "StatusId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "InterestId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "InterestId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "StatusCategories",
                keyColumn: "StatusCategoryId",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "FundReleases");

            migrationBuilder.DropColumn(
                name: "ReleaseDate",
                table: "FundReleases");

            migrationBuilder.RenameColumn(
                name: "LoanApplicationId",
                table: "LoanApprovals",
                newName: "ReviewApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_LoanApprovals_LoanApplicationId",
                table: "LoanApprovals",
                newName: "IX_LoanApprovals_ReviewApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanApprovals_ReviewApplications_ReviewApplicationId",
                table: "LoanApprovals",
                column: "ReviewApplicationId",
                principalTable: "ReviewApplications",
                principalColumn: "ReviewApplicationId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
