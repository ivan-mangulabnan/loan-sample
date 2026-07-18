namespace Models;

public class FundRelease
{
    public int FundReleaseId { get; set; }
    public int LoanApprovalId { get; set; }
    public int ReleasedByUserId { get; set; }
    public int StatusId { get; set; }
    public string? Remarks { get; set; }
}