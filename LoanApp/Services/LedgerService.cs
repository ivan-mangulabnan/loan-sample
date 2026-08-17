using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class LedgerService
{
    private readonly LoanAppDbContext _context;

    public LedgerService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<Ledger> GetOperatingLedgerAsync (int tenantId)
    {
        var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.TenantId == tenantId);
        return ledger ?? throw new InvalidOperationException($"Tenant {tenantId} has no operating ledger.");
    }

    public async Task<int> GetTransactionTypeIdAsync (string code)
    {
        var transactionType = await _context.TransactionTypes.FirstOrDefaultAsync(t => t.Code == code);
        return transactionType?.TransactionTypeId
            ?? throw new InvalidOperationException($"Transaction type '{code}' is not seeded.");
    }
}
