namespace Models;

public class Interest
{
    public int InterestId { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    
    public decimal InterestRate { get; set; }
}