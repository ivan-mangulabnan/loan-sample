using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class LoanApplicationService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;

    public LoanApplicationService(LoanAppDbContext context, StatusService statusService)
    {
        _context = context;
        _statusService = statusService;
    }

    public async Task<LoanApplication> CreateLoanApplicationAsync (int borrowerId, LoanApplicationRequest loanApplicationRequest)
    {
        var pendingReview = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.PendingReview);

        var loanApplication = new LoanApplication
        {
            BorrowerId = borrowerId,
            PaymentPlanId = loanApplicationRequest.PaymentPlanId,
            StatusId = pendingReview.StatusId,
            Amount = loanApplicationRequest.Amount,
            DateRequested = DateTime.UtcNow
        };

        _context.LoanApplications.Add(loanApplication);
        await _context.SaveChangesAsync();

        return loanApplication;
    }

    public async Task<LoanApplication?> GetLoanApplicationAsync (
        int loanApplicationId, int tenantId, int requesterId, bool isStaff)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Borrower).ThenInclude(b => b.Account)
            .Include(l => l.PaymentPlan).ThenInclude(p => p.Interest)
            .Include(l => l.Status)
            .Include(l => l.Reviews).ThenInclude(r => r.Reviewer).ThenInclude(u => u.Account)
            .Include(l => l.Reviews).ThenInclude(r => r.Status)
            .Include(l => l.Approvals).ThenInclude(a => a.Approver).ThenInclude(u => u.Account)
            .Include(l => l.Approvals).ThenInclude(a => a.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId
                                   && l.Borrower.TenantId == tenantId
                                   && (isStaff || l.BorrowerId == requesterId));

        return loanApplication;
    }

    /// <summary>
    /// Every application in the tenant, at any status. The queue endpoints are each
    /// filtered to one stage, so staff have no other way to see an application's
    /// whole history. Borrower is included here — unlike the /me query, which does
    /// not need it — because it is the column that makes a tenant-wide list usable.
    ///
    /// Returns a tuple rather than a PagedResponse so the service stays DTO-free and the
    /// controller owns the envelope — the PaymentService.GetPagedAsync convention.
    /// </summary>
    public async Task<(List<LoanApplication> Items, int TotalCount)> GetLoanApplicationsByTenantAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .ForTenant(tenantId)
            .WhereStatusCode(applicationQueryRequest.Status)
            .WhereMatches(applicationQueryRequest.Search);

        // Counted before the Includes: a bare COUNT over the filtered set, no joins.
        var totalCount = await query.CountAsync();

        var items = await query
            .WithApplicationDetail()
            // LoanApplicationId breaks ties: DateRequested is a UtcNow stamp, so two
            // applications submitted in the same tick would let Skip/Take repeat one row
            // on two pages and drop another entirely.
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Skip(applicationQueryRequest.Skip)
            .Take(applicationQueryRequest.PageSize)
            // Reviews and Approvals are collections — two reviews and one approval per
            // application in live data — so one query would drag six joined rows back
            // per application, times the page size.
            .AsSplitQuery()
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<LoanApplication> Items, int TotalCount)> GetLoanApplicationsByUserAsync (
        int borrowerId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .Where(l => l.BorrowerId == borrowerId)
            .WhereStatusCode(applicationQueryRequest.Status)
            .WhereMatches(applicationQueryRequest.Search);

        var totalCount = await query.CountAsync();

        // This query carried no OrderBy at all before it was paged. Skip/Take over an
        // unordered set returns whatever the server finds convenient, so the ordering is
        // load-bearing here rather than cosmetic.
        var items = await query
            // includeBorrower: false — the reader is the borrower.
            .WithApplicationDetail(includeBorrower: false)
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Skip(applicationQueryRequest.Skip)
            .Take(applicationQueryRequest.PageSize)
            .AsSplitQuery()
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<LoanApplication?> UpdatePaymentPlanAsync (int loanApplicationId, int borrowerId, int paymentPlanId)
    {
        var loanApplication = await GetOwnedAsync(loanApplicationId, borrowerId);

        if (loanApplication is null) return null;

        var targetCode = loanApplication.Status.Code switch
        {
            LoanApplicationStatusCodes.ReturnedByReviewer => LoanApplicationStatusCodes.PendingReview,
            _ => throw new InvalidOperationException($"Cannot edit an application with status '{loanApplication.Status.Code}'.")
        };

        var targetStatus = await _statusService.GetRequiredApplicationStatusAsync(targetCode);

        loanApplication.PaymentPlanId = paymentPlanId;
        loanApplication.StatusId = targetStatus.StatusId;
        await _context.SaveChangesAsync();

        return loanApplication;
    }

    public async Task<LoanApplication?> CancelAsync (int loanApplicationId, int borrowerId)
    {
        var loanApplication = await GetOwnedAsync(loanApplicationId, borrowerId);

        if (loanApplication is null) return null;

        if (LoanApplicationStatusCodes.Terminal.Contains(loanApplication.Status.Code)
            || loanApplication.Status.Code == LoanApplicationStatusCodes.PendingRelease)
            throw new InvalidOperationException($"Cannot cancel an application with status '{loanApplication.Status.Code}'.");

        var cancelled = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.Cancelled);

        loanApplication.StatusId = cancelled.StatusId;
        await _context.SaveChangesAsync();

        return loanApplication;
    }

    private async Task<LoanApplication?> GetOwnedAsync (int loanApplicationId, int borrowerId)
    {
        return await _context.LoanApplications
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId && l.BorrowerId == borrowerId);
    }
}
