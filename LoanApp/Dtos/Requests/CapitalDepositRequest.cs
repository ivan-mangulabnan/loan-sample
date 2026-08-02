using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class CapitalDepositRequest
{
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
}
