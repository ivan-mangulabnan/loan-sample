namespace Models;

public class Loans
{
    public int LoanId { get; set; }
    public int UserId { get; set; }
    public int PaymentPlanId { get; set; }
    public decimal TotalRepaymentAmount { get; set; }
    public decimal Balance { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public required string Status { get; set; }
}