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
    /// Returns the filtered list whole, up to ListLimit.MaxRows. The reader's screen
    /// decides how much of it is visible at once, and the reader's screen is not
    /// something this layer can see.
    /// </summary>
    public async Task<List<LoanApplication>> GetLoanApplicationsByTenantAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .ForTenant(tenantId)
            .WhereStatusCode(applicationQueryRequest.Status)
            .WhereMatches(applicationQueryRequest.Search);

        return await query
            .WithApplicationDetail()
            // LoanApplicationId breaks ties: DateRequested is a UtcNow stamp, so two
            // applications submitted in the same tick would otherwise come back in
            // whatever order the server found convenient, and the client pages this
            // list by position.
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Take(ListLimit.MaxRows)
            // Reviews and Approvals are collections — two reviews and one approval per
            // application in live data — so one query would drag six joined rows back
            // per application, times the page size.
            .AsSplitQuery()
            .ToListAsync();
    }

    public async Task<List<LoanApplication>> GetLoanApplicationsByUserAsync (
        int borrowerId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .Where(l => l.BorrowerId == borrowerId)
            .WhereStatusCode(applicationQueryRequest.Status)
            .WhereMatches(applicationQueryRequest.Search);

        // This query carried no OrderBy at all before. An unordered list is returned in
        // whatever order the server finds convenient, which is a different order on two
        // requests — so the ordering is load-bearing here rather than cosmetic.
        return await query
            // includeBorrower: false — the reader is the borrower.
            .WithApplicationDetail(includeBorrower: false)
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Take(ListLimit.MaxRows)
            .AsSplitQuery()
            .ToListAsync();
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
