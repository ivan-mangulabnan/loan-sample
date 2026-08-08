namespace Models;

public class Status
{
    public int StatusId { get; set; }

    public int StatusCategoryId { get; set; }
    public StatusCategory StatusCategory { get; set; } = null!;
    
    public required string Code { get; set; }
    public required string Label { get; set; }
}