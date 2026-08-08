using Models;

namespace Dtos.Responses;

public class LoanApprovalResponse
{
    public DateTime ApprovalDate { get; set; }
    public string Status { get; set; } = null!;
    public string? Remarks { get; set; }

    public string? Approver { get; set; }

    public decimal InterestRate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal TotalRepaymentAmount { get; set; }

    public static LoanApprovalResponse From (LoanApproval loanApproval, bool showStaffNames) => new()
    {
        ApprovalDate = loanApproval.ApprovalDate,
        Status = loanApproval.Status.Label,
        Remarks = loanApproval.Remarks,
        Approver = showStaffNames ? PersonName.Of(loanApproval.Approver) : null,
        InterestRate = loanApproval.InterestRate,
        PrincipalAmount = loanApproval.PrincipalAmount,
        NumberOfMonths = loanApproval.NumberOfMonths,
        TotalRepaymentAmount = loanApproval.TotalRepaymentAmount
    };
}
