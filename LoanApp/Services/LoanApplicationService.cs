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
        var pendingStatus = await _statusService.GetStatusByCodeAsync("PENDING");

        if (pendingStatus is null) throw new InvalidOperationException("Status 'PENDING' is not seeded.");

        var loanApplication = new LoanApplication
        {
            BorrowerId = borrowerId,
            PaymentPlanId = loanApplicationRequest.PaymentPlanId,
            StatusId = pendingStatus.StatusId,
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
            .Include(l => l.Borrower)
            .Include(l => l.PaymentPlan)
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId && l.Borrower.TenantId == tenantId);

        return loanApplication;
    }

    public async Task<List<LoanApplication>> GetLoanApplicationsByUserAsync (int borrowerId)
    {
        var loanApplications = await _context.LoanApplications
            .Include(l => l.PaymentPlan)
            .Include(l => l.Status)
            .Where(l => l.BorrowerId == borrowerId)
            .ToListAsync();

        return loanApplications;
    }

    public async Task<LoanApplication?> UpdatePaymentPlanAsync (int loanApplicationId, int borrowerId, int paymentPlanId)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId && l.BorrowerId == borrowerId);

        if (loanApplication is null) return null;

        if (loanApplication.Status.Code != "PENDING" && loanApplication.Status.Code != "RETURNED")
            throw new InvalidOperationException($"Cannot edit an application with status '{loanApplication.Status.Code}'.");

        var pendingStatus = await _statusService.GetStatusByCodeAsync("PENDING");

        if (pendingStatus is null) throw new InvalidOperationException("Status 'PENDING' is not seeded.");

        loanApplication.PaymentPlanId = paymentPlanId;
        loanApplication.StatusId = pendingStatus.StatusId;
        await _context.SaveChangesAsync();

        return loanApplication;
    }
}
