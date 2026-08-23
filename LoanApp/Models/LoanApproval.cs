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

    // The inverse of FundRelease.LoanApproval. A release carries the remark explaining
    // why money moved or why it did not, and without this the only path to it is from
    // the release side — so an application read could never reach its own outcome.
    // Convention binds it to the existing LoanApprovalId FK; there is no schema change.
    public ICollection<FundRelease> FundReleases { get; set; } = [];
}