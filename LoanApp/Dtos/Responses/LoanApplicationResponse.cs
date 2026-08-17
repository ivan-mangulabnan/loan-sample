using Models;

namespace Dtos.Responses;

public class LoanApplicationResponse
{
    public int LoanApplicationId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DateRequested { get; set; }

    public string Status { get; set; } = null!;

    public PaymentPlanResponse PaymentPlan { get; set; } = null!;

    public string? Borrower { get; set; }

    public List<ReviewApplicationResponse> Reviews { get; set; } = [];
    public List<LoanApprovalResponse> Approvals { get; set; } = [];

    public static LoanApplicationResponse From (LoanApplication loanApplication, bool showStaffNames) => new()
    {
        LoanApplicationId = loanApplication.LoanApplicationId,
        Amount = loanApplication.Amount,
        DateRequested = loanApplication.DateRequested,
        Status = loanApplication.Status.Label,
        PaymentPlan = PaymentPlanResponse.From(loanApplication.PaymentPlan),
        Borrower = loanApplication.Borrower is null ? null : PersonName.Of(loanApplication.Borrower),

        Reviews = loanApplication.Reviews
            .OrderBy(r => r.DatePosted)
            .Select(r => ReviewApplicationResponse.From(r, showStaffNames))
            .ToList(),
        Approvals = loanApplication.Approvals
            .OrderBy(a => a.ApprovalDate)
            .Select(a => LoanApprovalResponse.From(a, showStaffNames))
            .ToList()
    };

    public static List<LoanApplicationResponse> From (IEnumerable<LoanApplication> loanApplications, bool showStaffNames) =>
        loanApplications.Select(l => From(l, showStaffNames)).ToList();
}
