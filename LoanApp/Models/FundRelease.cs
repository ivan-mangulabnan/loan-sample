namespace Models;

public class FundRelease
{
    public int FundReleaseId { get; set; }

    public int LoanApprovalId { get; set; }
    public LoanApproval LoanApproval { get; set; } = null!;

    public int ReleasedByUserId { get; set; }
    public User ReleasedBy { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public string? Remarks { get; set; }
}