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

    public async Task<LoanApplication?> GetLoanApplicationAsync (int loanApplicationId, int tenantId)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Borrower).ThenInclude(b => b.Account)
            .Include(l => l.PaymentPlan).ThenInclude(p => p.Interest)
            .Include(l => l.Status)
            .Include(l => l.Reviews).ThenInclude(r => r.Reviewer).ThenInclude(u => u.Account)
            .Include(l => l.Reviews).ThenInclude(r => r.Status)
            .Include(l => l.Approvals).ThenInclude(a => a.Approver).ThenInclude(u => u.Account)
            .Include(l => l.Approvals).ThenInclude(a => a.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId && l.Borrower.TenantId == tenantId);

        return loanApplication;
    }

    public async Task<List<LoanApplication>> GetLoanApplicationsByUserAsync (int borrowerId)
    {
        var loanApplications = await _context.LoanApplications
            .Include(l => l.PaymentPlan).ThenInclude(p => p.Interest)
            .Include(l => l.Status)
            .Include(l => l.Reviews).ThenInclude(r => r.Reviewer).ThenInclude(u => u.Account)
            .Include(l => l.Reviews).ThenInclude(r => r.Status)
            .Include(l => l.Approvals).ThenInclude(a => a.Approver).ThenInclude(u => u.Account)
            .Include(l => l.Approvals).ThenInclude(a => a.Status)
            .Where(l => l.BorrowerId == borrowerId)
            .ToListAsync();

        return loanApplications;
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
