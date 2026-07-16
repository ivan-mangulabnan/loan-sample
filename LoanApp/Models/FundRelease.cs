namespace Models;

public class FundRelease
{
    public int FundReleaseId { get; set; }
    public int LoanApprovalId { get; set; }
    public int UserId { get; set; }
    public int LoanApplicationId { get; set; }
    public string? Remarks { get; set; }
    public required string Status { get; set; }
}