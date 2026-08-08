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

    public static LoanApplicationResponse From (LoanApplication loanApplication) => new()
    {
        LoanApplicationId = loanApplication.LoanApplicationId,
        Amount = loanApplication.Amount,
        DateRequested = loanApplication.DateRequested,
        Status = loanApplication.Status.Label,
        PaymentPlan = PaymentPlanResponse.From(loanApplication.PaymentPlan),
        Borrower = loanApplication.Borrower is null ? null : PersonName.Of(loanApplication.Borrower)
    };

    public static List<LoanApplicationResponse> From (IEnumerable<LoanApplication> loanApplications) =>
        loanApplications.Select(From).ToList();
}
