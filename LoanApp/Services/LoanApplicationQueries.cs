using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

internal static class LoanApplicationQueries
{
    public static IQueryable<LoanApplication> ForTenant (this IQueryable<LoanApplication> query, int tenantId)
    {
        return query.Where(l => l.Borrower.TenantId == tenantId);
    }

    public static IQueryable<LoanApplication> WhereStatusCode (this IQueryable<LoanApplication> query, string? statusCode)
    {
        if (string.IsNullOrWhiteSpace(statusCode)) return query;

        return query.Where(l => l.Status.Code == statusCode);
    }

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
