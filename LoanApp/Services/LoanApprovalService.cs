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

        if (loanApplication.Status.Code != LoanApplicationStatusCodes.PendingApproval)
            throw new InvalidOperationException($"Cannot approve an application with status '{loanApplication.Status.Code}'.");

        if (loanApprovalRequest.Decision is Decision.Reject
            && string.IsNullOrWhiteSpace(loanApprovalRequest.Remarks))
            throw new InvalidOperationException(
                "Remarks are required when rejecting an application.");

        var (approvalCode, applicationCode) = loanApprovalRequest.Decision switch
        {
            Decision.Approve => (LoanApplicationStatusCodes.Approved, LoanApplicationStatusCodes.PendingRelease),
            Decision.Reject => (LoanApplicationStatusCodes.Rejected, LoanApplicationStatusCodes.Rejected),
            _ => throw new InvalidOperationException(
                "An approver can only approve or reject; returning is a reviewer decision.")
        };

        var approvalStatus = await _statusService.GetRequiredApplicationStatusAsync(approvalCode);
        var applicationStatus = await _statusService.GetRequiredApplicationStatusAsync(applicationCode);

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

    public async Task<List<LoanApplication>> GetQueueAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .ForTenant(tenantId)
            .WhereStatusCode(LoanApplicationStatusCodes.PendingApproval)
            .WhereMatches(applicationQueryRequest.Search);

        return await query
            .WithApplicationDetail()
            .OrderBy(l => l.DateRequested)
            .ThenBy(l => l.LoanApplicationId)
            .Take(ListLimit.MaxRows)
            .AsSplitQuery()
            .ToListAsync();
    }
}
