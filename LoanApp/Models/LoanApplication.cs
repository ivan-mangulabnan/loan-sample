namespace Models;

public class LoanApplication
{
    public int LoanApplicationId { get; set; }
    public int UserId { get; set; }
    public int PaymentPlanId { get; set; }
    public int StatusId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DateRequested { get; set; }
}