using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class ResubmitApplicationRequest
{
    [Required]
    public int PaymentPlanId { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? Amount { get; set; }
}
