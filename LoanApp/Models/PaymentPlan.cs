namespace Models;

public class PaymentPlan
{
    public int PaymentPlanId { get; set; }

    public int InterestId { get; set; }
    public Interest Interest { get; set; } = null!;
    
    public required int NumberOfMonths { get; set; }
}