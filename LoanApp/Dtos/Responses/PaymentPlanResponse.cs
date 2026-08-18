using Models;

namespace Dtos.Responses;

public class PaymentPlanResponse
{
    // Carried so a client can send it back as LoanApplicationRequest.PaymentPlanId.
    // Without it the plan picker on an application form has a label and no key.
    public int PaymentPlanId { get; set; }

    public string Name { get; set; } = null!;
    public int NumberOfMonths { get; set; }
    public decimal InterestRate { get; set; }

    /// <summary>
    /// Requires Interest to be loaded — the rate lives on the related row, not on the
    /// plan. Callers that project this must Include it or this throws.
    /// </summary>
    public static PaymentPlanResponse From (PaymentPlan paymentPlan) => new()
    {
        PaymentPlanId = paymentPlan.PaymentPlanId,
        Name = paymentPlan.Name,
        NumberOfMonths = paymentPlan.NumberOfMonths,
        InterestRate = paymentPlan.Interest.InterestRate
    };

    public static List<PaymentPlanResponse> From (IEnumerable<PaymentPlan> paymentPlans) =>
        paymentPlans.Select(From).ToList();
}
