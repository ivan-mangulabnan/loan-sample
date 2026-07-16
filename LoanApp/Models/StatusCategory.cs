namespace Models;

public class StatusCategory
{
    public int StatusCategoryId { get; set; }
    public int TenantId { get; set; }
    public required string Code { get; set; }
}