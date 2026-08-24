using Models;

namespace Dtos.Responses;

public class PaymentPlanResponse
{
    public int PaymentPlanId { get; set; }

    public string Name { get; set; } = null!;
    public int NumberOfMonths { get; set; }
    public decimal InterestRate { get; set; }

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
