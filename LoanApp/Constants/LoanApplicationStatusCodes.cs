namespace Constants;

public static class LoanApplicationStatusCodes
{
    public const string PendingReview = "PENDING_REVIEW";
    public const string PendingApproval = "PENDING_APPROVAL";
    public const string PendingRelease = "PENDING_RELEASE";
    public const string Released = "RELEASED";
    public const string ReturnedByReviewer = "RETURNED_BY_REVIEWER";
    public const string Rejected = "REJECTED";
    public const string Cancelled = "CANCELLED";
    public const string Approved = "APPROVED";

    public static readonly string[] All =
    [
        PendingReview, PendingApproval, PendingRelease, Released,
        ReturnedByReviewer, Rejected, Cancelled, Approved
    ];

    public static readonly string[] Terminal = [Released, Rejected, Cancelled];
}
