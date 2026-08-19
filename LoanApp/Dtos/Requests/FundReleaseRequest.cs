using System.ComponentModel.DataAnnotations;
using Constants;

namespace Dtos.Requests;

public class FundReleaseRequest
{
    [Range(1, int.MaxValue)]
    public int LoanApprovalId { get; set; }

    /// <summary>
    /// Nullable, unlike LoanApprovalRequest.Decision and ReviewApplicationRequest.Decision.
    /// That divergence is deliberate and this is the one place it matters most.
    ///
    /// A non-nullable enum defaults to 0 and [Required] cannot catch it, so a body that
    /// omits "decision" binds to Decision.Approve. On the other two desks that silently
    /// advances an application; here it draws down the operating ledger, opens a loan and
    /// writes four tables, none of which the API can undo. Nullable turns the omission
    /// into a 400.
    /// </summary>
    [Required]
    public Decision? Decision { get; set; }

    public string? Remarks { get; set; }
}
