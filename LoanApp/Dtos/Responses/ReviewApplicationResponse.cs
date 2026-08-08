using Models;

namespace Dtos.Responses;

public class ReviewApplicationResponse
{
    public DateTime DatePosted { get; set; }
    public string Status { get; set; } = null!;
    public string? Remarks { get; set; }

    public string? Reviewer { get; set; }

    public static ReviewApplicationResponse From (ReviewApplication reviewApplication, bool showStaffNames) => new()
    {
        DatePosted = reviewApplication.DatePosted,
        Status = reviewApplication.Status.Label,
        Remarks = reviewApplication.Remarks,
        Reviewer = showStaffNames ? PersonName.Of(reviewApplication.Reviewer) : null
    };
}
