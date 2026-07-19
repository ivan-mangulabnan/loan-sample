namespace Models;

public class PaymentPlan
{
    public int PaymentPlanId { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int InterestId { get; set; }
    public Interest Interest { get; set; } = null!;
    
    public required int NumberOfMonths { get; set; }
}