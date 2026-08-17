using Models;

namespace Dtos.Responses;

public class PaymentPlanResponse
{
    public string Name { get; set; } = null!;
    public int NumberOfMonths { get; set; }
    public decimal InterestRate { get; set; }

    public static PaymentPlanResponse From (PaymentPlan paymentPlan) => new()
    {
        Name = paymentPlan.Name,
        NumberOfMonths = paymentPlan.NumberOfMonths,
        InterestRate = paymentPlan.Interest.InterestRate
    };
}
