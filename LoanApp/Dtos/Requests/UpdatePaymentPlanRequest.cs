using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class UpdatePaymentPlanRequest
{
    [Required]
    public int PaymentPlanId { get; set; }
}
