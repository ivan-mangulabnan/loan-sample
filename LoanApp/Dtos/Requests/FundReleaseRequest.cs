using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class FundReleaseRequest
{
    [Range(1, int.MaxValue)]
    public int LoanApprovalId { get; set; }

    public string? Remarks { get; set; }
}
