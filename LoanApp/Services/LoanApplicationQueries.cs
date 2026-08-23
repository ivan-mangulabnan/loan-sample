using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

/// <summary>
/// The filter and Include chain shared by every application-shaped list: the tenant-wide
/// list, a borrower's own applications, and the review and approval queues. They differ
/// only in which stage they pin and how they order, so those two stay in each service's
/// own method and everything else lives here once.
///
/// Extension methods on IQueryable rather than a private helper on LoanApplicationService:
/// three different services compose this, and injecting one service into another to reach
/// a private method would couple the review desk to the application desk for nothing.
/// </summary>
internal static class LoanApplicationQueries
{
    /// <summary>
    /// Tenant scope. Applied first and unconditionally — every other clause narrows
    /// within a tenancy, never across one.
    /// </summary>
    public static IQueryable<LoanApplication> ForTenant (this IQueryable<LoanApplication> query, int tenantId)
    {
        return query.Where(l => l.Borrower.TenantId == tenantId);
    }

    /// <summary>
    /// Pins one stage by status CODE, not label. A null or blank code does not filter,
    /// and an unknown code simply matches nothing — an empty page rather than a 500,
    /// because a stale bookmark is not an error condition.
    /// </summary>
    public static IQueryable<LoanApplication> WhereStatusCode (this IQueryable<LoanApplication> query, string? statusCode)
    {
        if (string.IsNullOrWhiteSpace(statusCode)) return query;

        return query.Where(l => l.Status.Code == statusCode);
    }

    /// <summary>
    /// Reference number when the term is a number, borrower name otherwise. The UI prints
    /// a reference as "#12", so a leading '#' is stripped rather than failing to parse.
    ///
    /// Two things are deliberate. The name match reads Account.FirstName/LastName as
    /// columns and not PersonName.Of, which is a C# method EF cannot translate — it would
    /// throw at query time, not compile time. And there is no ToLower(): the database
    /// collates SQL_Latin1_General_CP1_CI_AS, so Contains is already case-insensitive and
    /// lowering both sides only costs the index.
    /// </summary>
    public static IQueryable<LoanApplication> WhereMatches (this IQueryable<LoanApplication> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var term = search.Trim().TrimStart('#');
        if (term.Length == 0) return query;

        if (int.TryParse(term, out var reference))
            return query.Where(l => l.LoanApplicationId == reference);

        return query.Where(l => l.Borrower.Account != null
                             && (l.Borrower.Account.FirstName.Contains(term)
                              || l.Borrower.Account.LastName.Contains(term)));
    }

    /// <summary>
    /// The full read graph behind LoanApplicationResponse. Applied after CountAsync so the
    /// count stays a bare COUNT over the filtered set with no joins at all.
    ///
    /// Reviews and Approvals are collections — live data carries two reviews and one
    /// approval per application — so a single query would return one application as six
    /// joined rows. Callers pair this with AsSplitQuery for that reason. Borrower is
    /// optional because the /me list already knows who the borrower is.
    /// </summary>
    public static IQueryable<LoanApplication> WithApplicationDetail (
        this IQueryable<LoanApplication> query, bool includeBorrower = true)
    {
        if (includeBorrower)
            query = query.Include(l => l.Borrower).ThenInclude(b => b.Account);

        return query
            .Include(l => l.PaymentPlan).ThenInclude(p => p.Interest)
            .Include(l => l.Status)
            .Include(l => l.Reviews).ThenInclude(r => r.Reviewer).ThenInclude(u => u.Account)
            .Include(l => l.Reviews).ThenInclude(r => r.Status)
            .Include(l => l.Approvals).ThenInclude(a => a.Approver).ThenInclude(u => u.Account)
            .Include(l => l.Approvals).ThenInclude(a => a.Status)
            .Include(l => l.Approvals).ThenInclude(a => a.FundReleases).ThenInclude(f => f.Status);
    }
}
