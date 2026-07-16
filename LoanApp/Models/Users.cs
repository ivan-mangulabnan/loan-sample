namespace Models;

public class Users
{
    public int UserId { get; set; }
    public int TenantId { get; set; }
    public int RoleId { get; set; }
    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
}