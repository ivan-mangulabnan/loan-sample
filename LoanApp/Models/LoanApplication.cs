namespace Models;

public class LoanApplication
{
    public int LoanApplicationId { get; set; }

    public int BorrowerId { get; set; }
    public User Borrower { get; set; } = null!;

    public int PaymentPlanId { get; set; }
    public PaymentPlan PaymentPlan { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public decimal Amount { get; set; }
    public DateTime DateRequested { get; set; }
}