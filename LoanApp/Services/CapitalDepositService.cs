using Constants;
using Data;
using Dtos.Requests;
using Models;

namespace Services;

public class CapitalDepositService
{
    private readonly LoanAppDbContext _context;
    private readonly LedgerService _ledgerService;

    public CapitalDepositService (LoanAppDbContext context, LedgerService ledgerService)
    {
        _context = context;
        _ledgerService = ledgerService;
    }

    public async Task<CapitalDeposit?> DepositAsync (int adminUserId, int tenantId, CapitalDepositRequest capitalDepositRequest)
    {
        var ledger = await _ledgerService.GetOperatingLedgerAsync(tenantId);
        var transactionTypeId = await _ledgerService.GetTransactionTypeIdAsync(TransactionTypeCodes.CapitalDeposit);
        var amount = capitalDepositRequest.Amount;

        var capitalDeposit = new CapitalDeposit
        {
            LedgerId = ledger.LedgerId,
            PostedByUserId = adminUserId,
            Amount = amount,
            DatePosted = DateTime.UtcNow
        };

        await using var databaseTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.CapitalDeposits.Add(capitalDeposit);
            await _context.SaveChangesAsync();

            _context.Transactions.Add(new Transaction
            {
                LedgerId = ledger.LedgerId,
                TransactionTypeId = transactionTypeId,
                ReferenceId = capitalDeposit.CapitalDepositId,
                Amount = amount,
                CreatedAt = DateTime.UtcNow
            });

            ledger.CurrentBalance += amount;
            await _context.SaveChangesAsync();

            await databaseTransaction.CommitAsync();
        }
        catch
        {
            await databaseTransaction.RollbackAsync();
            throw;
        }

        return capitalDeposit;
    }
}
