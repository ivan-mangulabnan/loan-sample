namespace Models;

public class Tenant
{
    public int TenantId { get; set; }
    public ICollection<User> Users { get; } = new List<User>();
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}