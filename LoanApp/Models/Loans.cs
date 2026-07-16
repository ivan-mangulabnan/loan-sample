namespace Models;

public class Loans
{
    public int LoanId { get; set; }
    public int UserId { get; set; }
    public int PaymentPlanId { get; set; }
    public required decimal TotalRepaymentAmount { get; set; }
    public decimal Balance { get; set; }
    public required DateTime StartDate { get; set; }
    public required DateTime DueDate { get; set; }
    public required string Status { get; set; }
}