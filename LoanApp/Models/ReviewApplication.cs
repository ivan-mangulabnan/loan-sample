namespace Models;

public class ReviewApplication
{
    public int ReviewApplicationId { get; set; }
    public int ReviewerUserId { get; set; }
    public int LoanApplicationId { get; set; }
    public int StatusId { get; set; }
    public required string Remarks { get; set; }
    public DateTime DatePosted { get; set; }
}