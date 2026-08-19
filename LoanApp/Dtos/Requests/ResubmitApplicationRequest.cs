using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

/// <summary>
/// What a borrower may change on an application the reviewer sent back. Both fields,
/// because a return whose remarks say "amount too high" is unanswerable if only the
/// plan can move.
/// </summary>
public class ResubmitApplicationRequest
{
    [Required]
    public int PaymentPlanId { get; set; }

    /// <summary>
    /// Nullable so that omitting it means "keep what was asked for" rather than "borrow
    /// nothing". [Range] only fires on a value that is actually present, which is the
    /// behaviour wanted here — a bare plan change is still a valid resubmission.
    /// </summary>
    [Range(0.01, double.MaxValue)]
    public decimal? Amount { get; set; }
}
