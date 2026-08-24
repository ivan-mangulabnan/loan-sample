using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class FundReleaseService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;
    private readonly LedgerService _ledgerService;
    private readonly LoanService _loanService;

    public FundReleaseService (LoanAppDbContext context, StatusService statusService, LedgerService ledgerService, LoanService loanService)
    {
        _context = context;
        _statusService = statusService;
        _ledgerService = ledgerService;
        _loanService = loanService;
    }

    public async Task<List<LoanApproval>> GetQueueAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApprovals
            .Where(a => a.LoanApplication.Borrower.TenantId == tenantId
                     && a.LoanApplication.Status.Code == LoanApplicationStatusCodes.PendingRelease);

        query = ApplySearch(query, applicationQueryRequest.Search);

        return await query
            .Include(a => a.Approver).ThenInclude(u => u.Account)
            .Include(a => a.Status)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Borrower).ThenInclude(b => b.Account)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Status)
            .Include(a => a.LoanApplication).ThenInclude(l => l.PaymentPlan)
            .OrderBy(a => a.ApprovalDate)
            .ThenBy(a => a.LoanApprovalId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
    }

    private static IQueryable<LoanApproval> ApplySearch (IQueryable<LoanApproval> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var term = search.Trim().TrimStart('#');
        if (term.Length == 0) return query;

        if (int.TryParse(term, out var reference))
            return query.Where(a => a.LoanApplicationId == reference);

        return query.Where(a => a.LoanApplication.Borrower.Account != null
                             && (a.LoanApplication.Borrower.Account.FirstName.Contains(term)
                              || a.LoanApplication.Borrower.Account.LastName.Contains(term)));
    }

    public async Task<FundRelease?> DecideAsync (int adminUserId, int tenantId, FundReleaseRequest fundReleaseRequest)
    {
        var loanApproval = await _context.LoanApprovals
            .Include(a => a.LoanApplication).ThenInclude(l => l.Borrower)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Status)
            .FirstOrDefaultAsync(a => a.LoanApprovalId == fundReleaseRequest.LoanApprovalId
                                   && a.LoanApplication.Borrower.TenantId == tenantId);

        if (loanApproval is null) return null;

        var loanApplication = loanApproval.LoanApplication;

        if (loanApplication.Status.Code != LoanApplicationStatusCodes.PendingRelease)
            throw new InvalidOperationException($"Cannot act on an application with status '{loanApplication.Status.Code}'.");

        if (fundReleaseRequest.Decision is Decision.Reject
            && string.IsNullOrWhiteSpace(fundReleaseRequest.Remarks))
            throw new InvalidOperationException(
                "Remarks are required when rejecting a release.");

        return fundReleaseRequest.Decision switch
        {
            Decision.Approve => await ReleaseAsync(adminUserId, tenantId, loanApproval, fundReleaseRequest.Remarks),
            Decision.Reject => await RejectAsync(adminUserId, loanApproval, fundReleaseRequest.Remarks),
            _ => throw new InvalidOperationException(
                "The release desk can only release or reject; returning is a reviewer decision.")
        };
    }

    private async Task<FundRelease> ReleaseAsync (int adminUserId, int tenantId, LoanApproval loanApproval, string? remarks)
    {
        var loanApplication = loanApproval.LoanApplication;
        var ledger = await _ledgerService.GetOperatingLedgerAsync(tenantId);
        var amount = loanApproval.PrincipalAmount;

        if (ledger.CurrentBalance < amount)
            throw new InvalidOperationException(
                $"Insufficient funds: ledger holds {ledger.CurrentBalance:N2}, release requires {amount:N2}.");

        var releasedStatus = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.Released);
        var transactionTypeId = await _ledgerService.GetTransactionTypeIdAsync(TransactionTypeCodes.FundRelease);

        var fundRelease = new FundRelease
        {
            LoanApprovalId = loanApproval.LoanApprovalId,
            ReleasedByUserId = adminUserId,
            StatusId = releasedStatus.StatusId,
            Amount = amount,
            ReleaseDate = DateTime.UtcNow,
            Remarks = remarks
        };

        await using var databaseTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.FundReleases.Add(fundRelease);
            await _context.SaveChangesAsync();

            await _loanService.CreateFromReleaseAsync(loanApproval, fundRelease);

            _context.Transactions.Add(new Transaction
            {
                LedgerId = ledger.LedgerId,
                TransactionTypeId = transactionTypeId,
                ReferenceId = fundRelease.FundReleaseId,
                Amount = -amount,
                CreatedAt = DateTime.UtcNow
            });

            ledger.CurrentBalance -= amount;
            loanApplication.StatusId = releasedStatus.StatusId;
            await _context.SaveChangesAsync();

            await databaseTransaction.CommitAsync();
        }
        catch
        {
            await databaseTransaction.RollbackAsync();
            throw;
        }

        return fundRelease;
    }

    private async Task<FundRelease> RejectAsync (int adminUserId, LoanApproval loanApproval, string? remarks)
    {
        var rejectedStatus = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.Rejected);

        var fundRelease = new FundRelease
        {
            LoanApprovalId = loanApproval.LoanApprovalId,
            ReleasedByUserId = adminUserId,
            StatusId = rejectedStatus.StatusId,
            Amount = 0m,
            ReleaseDate = DateTime.UtcNow,
            Remarks = remarks
        };

        loanApproval.LoanApplication.StatusId = rejectedStatus.StatusId;

        _context.FundReleases.Add(fundRelease);
        await _context.SaveChangesAsync();

        return fundRelease;
    }
}
