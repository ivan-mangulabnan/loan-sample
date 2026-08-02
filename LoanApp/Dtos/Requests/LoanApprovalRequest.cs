using System.ComponentModel.DataAnnotations;
using Constants;

namespace Dtos.Requests;

public class LoanApprovalRequest
{
    [Range(1, int.MaxValue)]
    public int LoanApplicationId { get; set; }

    [Required]
    public Decision Decision { get; set; }

    [Required]
    public string Remarks { get; set; } = null!;
}
