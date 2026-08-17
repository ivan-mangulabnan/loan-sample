using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class PaymentRequest
{
    [Range(1, int.MaxValue)]
    public int LoanId { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
}
