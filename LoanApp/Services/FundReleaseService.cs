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

    public FundReleaseService (LoanAppDbContext context, StatusService statusService, LedgerService ledgerService)
    {
        _context = context;
        _statusService = statusService;
        _ledgerService = ledgerService;
    }

    public async Task<FundRelease?> ReleaseFundsAsync (int adminUserId, int tenantId, FundReleaseRequest fundReleaseRequest)
    {
        var loanApproval = await _context.LoanApprovals
            .Include(a => a.LoanApplication).ThenInclude(l => l.Borrower)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Status)
            .FirstOrDefaultAsync(a => a.LoanApprovalId == fundReleaseRequest.LoanApprovalId
                                   && a.LoanApplication.Borrower.TenantId == tenantId);

        if (loanApproval is null) return null;

        var loanApplication = loanApproval.LoanApplication;

        if (loanApplication.Status.Code != LoanStatusCodes.PendingRelease)
            throw new InvalidOperationException($"Cannot release funds for an application with status '{loanApplication.Status.Code}'.");

        var ledger = await _ledgerService.GetOperatingLedgerAsync(tenantId);
        var amount = loanApproval.PrincipalAmount;

        if (ledger.CurrentBalance < amount)
            throw new InvalidOperationException(
                $"Insufficient funds: ledger holds {ledger.CurrentBalance:N2}, release requires {amount:N2}.");

        var releasedStatus = await GetStatusOrThrowAsync(LoanStatusCodes.Released);
        var transactionTypeId = await _ledgerService.GetTransactionTypeIdAsync(TransactionTypeCodes.FundRelease);

        var fundRelease = new FundRelease
        {
            LoanApprovalId = loanApproval.LoanApprovalId,
            ReleasedByUserId = adminUserId,
            StatusId = releasedStatus.StatusId,
            Amount = amount,
            ReleaseDate = DateTime.UtcNow,
            Remarks = fundReleaseRequest.Remarks
        };

        await using var databaseTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.FundReleases.Add(fundRelease);
            await _context.SaveChangesAsync();

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

    private async Task<Status> GetStatusOrThrowAsync (string code)
    {
        var status = await _statusService.GetStatusByCodeAsync(code);
        return status ?? throw new InvalidOperationException($"Status '{code}' is not seeded.");
    }
}
