using Models;

namespace Dtos.Responses;

public class ReviewApplicationResponse
{
    public int LoanApplicationId { get; set; }
    public string Remarks { get; set; } = null!;
    public DateTime DatePosted { get; set; }

    public string Status { get; set; } = null!;
    public string Reviewer { get; set; } = null!;

    public static ReviewApplicationResponse From (ReviewApplication reviewApplication) => new()
    {
        LoanApplicationId = reviewApplication.LoanApplicationId,
        Remarks = reviewApplication.Remarks,
        DatePosted = reviewApplication.DatePosted,
        Status = reviewApplication.Status.Label,
        Reviewer = PersonName.Of(reviewApplication.Reviewer)
    };

    public static List<ReviewApplicationResponse> From (IEnumerable<ReviewApplication> reviewApplications) =>
        reviewApplications.Select(From).ToList();
}
