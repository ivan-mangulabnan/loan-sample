namespace Models;

public class Roles
{
    public int RoleId { get; set; }
    public int TenantId { get; set; }
    public required string Name { get; set; }
}