namespace Models;

public class ReviewApplication
{
    public int ReviewApplicationId { get; set; }

    public int ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;

    public int LoanApplicationId { get; set; }
    public LoanApplication LoanApplication { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public string? Remarks { get; set; }
    public DateTime DatePosted { get; set; }
}