using System.ComponentModel.DataAnnotations;
using Constants;

namespace Dtos.Requests;

public class FundReleaseRequest
{
    [Range(1, int.MaxValue)]
    public int LoanApprovalId { get; set; }

    [Required]
    public Decision? Decision { get; set; }

    public string? Remarks { get; set; }
}
