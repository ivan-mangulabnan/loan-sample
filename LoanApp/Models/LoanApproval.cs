namespace Models;

public class LoanApproval
{
    public int LoanApprovalId { get; set; }
    public int UserId { get; set; }
    public int LoanApplicationId { get; set; }
    public string? Remarks { get; set; }
    public required string Status { get; set; }
    public DateTime ApprovalDate { get; set; }
}