namespace Models;

public class LoanApproval
{
    public int LoanApprovalId { get; set; }
    public int ApproverUserId { get; set; }
    public int LoanApplicationId { get; set; }
    public int StatusId { get; set; }
    public string? Remarks { get; set; }
    public DateTime ApprovalDate { get; set; }
}