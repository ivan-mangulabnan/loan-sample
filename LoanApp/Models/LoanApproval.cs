namespace Models;

public class LoanApproval
{
    public int LoanApprovalId { get; set; }

    public int ApproverId { get; set; }
    public User Approver { get; set; } = null!;

    public int LoanApplicationId { get; set; }
    public LoanApplication LoanApplication { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public decimal InterestRate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal TotalRepaymentAmount { get; set; }

    public string? Remarks { get; set; }
    public DateTime ApprovalDate { get; set; }
}