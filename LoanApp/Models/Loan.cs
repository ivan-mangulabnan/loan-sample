namespace Models;

public class Loan
{
    public int LoanId { get; set; }
    public int LoanApprovalId { get; set; }
    public int BorrowerUserId { get; set; }
    public int PaymentPlanId { get; set; }
    public int StatusId { get; set; }
    public required decimal TotalRepaymentAmount { get; set; }
    public decimal Balance { get; set; }
    public required DateTime StartDate { get; set; }
    public required DateTime DueDate { get; set; }
}