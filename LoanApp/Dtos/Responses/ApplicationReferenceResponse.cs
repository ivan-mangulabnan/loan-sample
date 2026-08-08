using Models;

namespace Dtos.Responses;

public class ApplicationReferenceResponse
{
    public int LoanApplicationId { get; set; }
    public string Borrower { get; set; } = null!;

    public string PaymentPlan { get; set; } = null!;

    public static ApplicationReferenceResponse From (LoanApplication loanApplication) => new()
    {
        LoanApplicationId = loanApplication.LoanApplicationId,
        Borrower = PersonName.Of(loanApplication.Borrower),
        PaymentPlan = loanApplication.PaymentPlan.Name
    };
}
