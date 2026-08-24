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
            .WithApplicationDetail()
            .AsSplitQuery()
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId
                                   && l.Borrower.TenantId == tenantId
                                   && (isStaff || l.BorrowerId == requesterId));

        return loanApplication;
    }

    public async Task<List<LoanApplication>> GetLoanApplicationsByTenantAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .ForTenant(tenantId)
            .WhereStatusCode(applicationQueryRequest.Status)
            .WhereMatches(applicationQueryRequest.Search);

        return await query
            .WithApplicationDetail()
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Take(ListLimit.MaxRows)
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

        return await query
            .WithApplicationDetail(includeBorrower: false)
            .OrderByDescending(l => l.DateRequested)
            .ThenByDescending(l => l.LoanApplicationId)
            .Take(ListLimit.MaxRows)
            .AsSplitQuery()
            .ToListAsync();
    }

    public async Task<LoanApplication?> ResubmitAsync (int loanApplicationId, int borrowerId, int paymentPlanId, decimal? amount)
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
        if (amount.HasValue) loanApplication.Amount = amount.Value;
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
