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

    /// <summary>
    /// Nested under the approval rather than beside it on the application, because that
    /// is the real relationship: a release is a decision about one approval. Usually one
    /// entry, and empty until the application reaches a release desk.
    /// </summary>
    public List<FundReleaseResponse> Releases { get; set; } = [];

    public static LoanApprovalResponse From (LoanApproval loanApproval, bool showStaffNames) => new()
    {
        ApprovalDate = loanApproval.ApprovalDate,
        Status = loanApproval.Status.Label,
        Remarks = loanApproval.Remarks,
        Approver = showStaffNames ? PersonName.Of(loanApproval.Approver) : null,
        InterestRate = loanApproval.InterestRate,
        PrincipalAmount = loanApproval.PrincipalAmount,
        NumberOfMonths = loanApproval.NumberOfMonths,
        TotalRepaymentAmount = loanApproval.TotalRepaymentAmount,

        Releases = loanApproval.FundReleases
            .OrderBy(f => f.ReleaseDate)
            .Select(FundReleaseResponse.From)
            .ToList()
    };
}
