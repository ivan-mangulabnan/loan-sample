namespace Models;

public class User
{
    public int UserId { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
}