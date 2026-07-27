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

    public async Task<LoanApplication?> GetLoanApplicationAsync (int loanApplicationId)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.PaymentPlan)
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId);

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

    public async Task<LoanApplication?> UpdateStatusAsync (int loanApplicationId, int statusId)
    {
        var loanApplication = await _context.LoanApplications
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApplicationId);

        if (loanApplication is null) return null;

        loanApplication.StatusId = statusId;
        await _context.SaveChangesAsync();

        return loanApplication;
    }
}
