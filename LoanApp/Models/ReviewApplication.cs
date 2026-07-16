namespace Models;

public class ReviewApplication
{
    public int ReviewApplicationId { get; set; }
    public int UserId { get; set; }
    public int LoanApplicationId { get; set; }
    public required string Remarks { get; set; }
    public DateTime DatePosted { get; set; }
}