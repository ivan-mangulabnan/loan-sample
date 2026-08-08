using Models;

namespace Dtos.Responses;

public class FundReleaseQueueResponse
{
    public int LoanApprovalId { get; set; }
    public DateTime ApprovalDate { get; set; }
    public string Approver { get; set; } = null!;

    public decimal InterestRate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal TotalRepaymentAmount { get; set; }

    public ApplicationReferenceResponse Application { get; set; } = null!;

    public static FundReleaseQueueResponse From (LoanApproval loanApproval) => new()
    {
        LoanApprovalId = loanApproval.LoanApprovalId,
        ApprovalDate = loanApproval.ApprovalDate,
        Approver = PersonName.Of(loanApproval.Approver),
        InterestRate = loanApproval.InterestRate,
        PrincipalAmount = loanApproval.PrincipalAmount,
        NumberOfMonths = loanApproval.NumberOfMonths,
        TotalRepaymentAmount = loanApproval.TotalRepaymentAmount,
        Application = ApplicationReferenceResponse.From(loanApproval.LoanApplication)
    };

    public static List<FundReleaseQueueResponse> From (IEnumerable<LoanApproval> loanApprovals) =>
        loanApprovals.Select(From).ToList();
}
