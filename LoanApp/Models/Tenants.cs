namespace Models;

public class Tenants
{
    public int TenantId { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}