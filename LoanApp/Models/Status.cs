namespace Models;

public class Status
{
    public int StatusId { get; set; }
    public int TenantId { get; set; }
    public int StatusCategoryId { get; set; }
    public required string Code { get; set; }
}