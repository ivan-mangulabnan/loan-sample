using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class LoanApprovalService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;

    public LoanApprovalService (LoanAppDbContext context, StatusService statusService)
    {
        _context = context;
        _statusService = statusService;
    }

    public async Task<LoanApproval?> CreateApprovalAsync (int approverId, int tenantId, LoanApprovalRequest loanApprovalRequest)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Borrower)
            .Include(l => l.Status)
            .Include(l => l.PaymentPlan).ThenInclude(p => p.Interest)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == loanApprovalRequest.LoanApplicationId && l.Borrower.TenantId == tenantId);

        if (loanApplication is null) return null;

        if (loanApplication.Status.Code != LoanStatusCodes.PendingApproval)
            throw new InvalidOperationException($"Cannot approve an application with status '{loanApplication.Status.Code}'.");

        var (approvalCode, applicationCode) = loanApprovalRequest.Decision switch
        {
            Decision.Approve => (LoanStatusCodes.Approved, LoanStatusCodes.PendingRelease),
            Decision.Reject => (LoanStatusCodes.Rejected, LoanStatusCodes.Rejected),
            Decision.Return => (LoanStatusCodes.ReturnedByApprover, LoanStatusCodes.ReturnedByApprover),
            _ => throw new InvalidOperationException($"Unknown decision '{loanApprovalRequest.Decision}'.")
        };

        var approvalStatus = await GetStatusOrThrowAsync(approvalCode);
        var applicationStatus = await GetStatusOrThrowAsync(applicationCode);

        var interestRate = loanApplication.PaymentPlan.Interest.InterestRate;
        var principal = loanApplication.Amount;

        var loanApproval = new LoanApproval
        {
            ApproverId = approverId,
            LoanApplicationId = loanApplication.LoanApplicationId,
            StatusId = approvalStatus.StatusId,
            InterestRate = interestRate,
            PrincipalAmount = principal,
            NumberOfMonths = loanApplication.PaymentPlan.NumberOfMonths,
            TotalRepaymentAmount = Math.Round(principal * (1 + interestRate / 100m), 2, MidpointRounding.AwayFromZero),
            Remarks = loanApprovalRequest.Remarks,
            ApprovalDate = DateTime.UtcNow
        };

        loanApplication.StatusId = applicationStatus.StatusId;

        _context.LoanApprovals.Add(loanApproval);
        await _context.SaveChangesAsync();

        return loanApproval;
    }

    public async Task<List<LoanApproval>> GetApprovalsForApplicationAsync (int loanApplicationId, int tenantId)
    {
        return await _context.LoanApprovals
            .Include(a => a.Approver)
            .Include(a => a.Status)
            .Where(a => a.LoanApplicationId == loanApplicationId && a.LoanApplication.Borrower.TenantId == tenantId)
            .OrderBy(a => a.ApprovalDate)
            .ToListAsync();
    }

    public async Task<List<LoanApplication>> GetQueueAsync (int tenantId)
    {
        return await _context.LoanApplications
            .Include(l => l.Borrower)
            .Include(l => l.PaymentPlan)
            .Include(l => l.Status)
            .Where(l => l.Borrower.TenantId == tenantId && l.Status.Code == LoanStatusCodes.PendingApproval)
            .OrderBy(l => l.DateRequested)
            .ToListAsync();
    }

    private async Task<Status> GetStatusOrThrowAsync (string code)
    {
        var status = await _statusService.GetStatusByCodeAsync(code);
        return status ?? throw new InvalidOperationException($"Status '{code}' is not seeded.");
    }
}
