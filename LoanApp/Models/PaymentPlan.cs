namespace Models;

public class PaymentPlan
{
    public int PaymentPlanId { get; set; }
    public int TenantId { get; set; }
    public int InterestId { get; set; }
    public required int NumberOfMonths { get; set; }
}