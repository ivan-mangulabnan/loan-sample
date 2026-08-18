namespace Dtos.Requests;

/// <summary>
/// The loan list's query shape. Separate from ApplicationQueryRequest because the two
/// carry different status vocabularies — a loan is ACTIVE/PAID/OVERDUE/DEFAULTED, an
/// application is PENDING_REVIEW and friends — and merging them is how a filter ends up
/// sending a code the other category has never heard of (rule 20's mistake, server-side).
/// </summary>
public class LoanQueryRequest
{
    // Null means "do not filter". Matches the loan reference number.
    public string? Search { get; set; }

    // A LoanLifecycleCodes value, not a label.
    public string? Status { get; set; }
}
