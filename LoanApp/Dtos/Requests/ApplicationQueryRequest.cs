namespace Dtos.Requests;

/// <summary>
/// The one query shape behind every application-shaped list: the tenant-wide list, a
/// borrower's own applications, and the review and approval queues. They differ only in
/// which stage they pin and how they order, which is the service's business — not the
/// caller's.
///
/// Filters only. There is no page or page size: the client decides which filters to
/// send, the database applies them, and the whole filtered list comes back (capped by
/// ListLimit). Paging is the browser's, because only the browser knows how tall the
/// screen is.
/// </summary>
public class ApplicationQueryRequest
{
    // Null means "do not filter" — the PaymentQueryRequest convention. Matches a
    // reference number or part of the borrower's name; the service decides which by
    // whether the term parses as an int.
    public string? Search { get; set; }

    // The status CODE (PENDING_REVIEW), not the label ("Pending Review"). The response
    // carries the label, so the client maps one to the other; conflating them is how a
    // filter silently matches nothing. An unknown code is an empty page, not an error —
    // there is nothing unsafe about it, and 400ing would make the filter fragile.
    public string? Status { get; set; }

    // Deliberately no tenantId — that comes from the signed token and must not be
    // spoofable from the query string.
}
