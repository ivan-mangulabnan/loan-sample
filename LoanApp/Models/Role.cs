namespace Models;

public class Role
{
    public int RoleId { get; set; }
    public int TenantId { get; set; }
    public required string Name { get; set; }
}