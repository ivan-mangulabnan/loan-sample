using Models;

namespace Dtos.Responses;

public class LoanApprovalResponse
{
    public int LoanApprovalId { get; set; }
    public int LoanApplicationId { get; set; }

    public decimal InterestRate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal TotalRepaymentAmount { get; set; }

    public string? Remarks { get; set; }
    public DateTime ApprovalDate { get; set; }

    public string Status { get; set; } = null!;
    public string Approver { get; set; } = null!;

    public string? Borrower { get; set; }

    public static LoanApprovalResponse From (LoanApproval loanApproval) => new()
    {
        LoanApprovalId = loanApproval.LoanApprovalId,
        LoanApplicationId = loanApproval.LoanApplicationId,
        InterestRate = loanApproval.InterestRate,
        PrincipalAmount = loanApproval.PrincipalAmount,
        NumberOfMonths = loanApproval.NumberOfMonths,
        TotalRepaymentAmount = loanApproval.TotalRepaymentAmount,
        Remarks = loanApproval.Remarks,
        ApprovalDate = loanApproval.ApprovalDate,
        Status = loanApproval.Status.Label,
        Approver = PersonName.Of(loanApproval.Approver),
        Borrower = loanApproval.LoanApplication?.Borrower is null
            ? null
            : PersonName.Of(loanApproval.LoanApplication.Borrower)
    };

    public static List<LoanApprovalResponse> From (IEnumerable<LoanApproval> loanApprovals) =>
        loanApprovals.Select(From).ToList();
}
