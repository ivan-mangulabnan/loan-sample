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

    public async Task<List<Transaction>> GetTransactionsAsync (int tenantId, string? search, string? type)
    {
        var query = _context.Transactions.Where(t => t.Ledger.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(t => t.TransactionType.Code == type);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = int.TryParse(search, out var referenceId)
                ? query.Where(t => t.ReferenceId == referenceId)
                : query.Where(t => false);
        }

        return await query
            .Include(t => t.TransactionType)
            .OrderByDescending(t => t.CreatedAt)
            .ThenByDescending(t => t.TransactionId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
    }
}
