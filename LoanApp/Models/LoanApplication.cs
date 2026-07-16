namespace Models;

public class LoanApplication
{
    public int LoanApplicationId { get; set; }
    public int UserId { get; set; }
    public int PaymentPlanId { get; set; }
    public int Amount { get; set; }
    public required string Status { get; set; }
    public DateTime DateRequested { get; set; }
}