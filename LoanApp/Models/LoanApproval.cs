namespace Models;

public class LoanApproval
{
    public int LoanApprovalId { get; set; }

    public int ApproverUserId { get; set; }
    public User Approver { get; set; } = null!;

    public int ReviewApplicationId { get; set; }
    public ReviewApplication ReviewApplication { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public decimal InterestRate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal TotalRepaymentAmount { get; set; }

    public string? Remarks { get; set; }
    public DateTime ApprovalDate { get; set; }
}