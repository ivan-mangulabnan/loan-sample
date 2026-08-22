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

    /// <summary>
    /// The entries behind the balance. Until this existed the Transactions table was
    /// write-only — three services insert into it and nothing read it back — so the
    /// figure on the dashboard had nothing to account for itself with.
    ///
    /// Tenant comes from the caller's token, never the query string. Returns the filtered
    /// list whole, up to ListLimit.MaxRows — the client pages it.
    /// </summary>
    public async Task<List<Transaction>> GetTransactionsAsync (int tenantId, string? search, string? type)
    {
        // Through Ledger, not a column: Transaction has no TenantId, and Ledger is the
        // one entity that carries it directly.
        var query = _context.Transactions.Where(t => t.Ledger.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(t => t.TransactionType.Code == type);

        // ReferenceId is the only thing here worth searching — a transaction has no
        // borrower and no remarks. A term that is not a number therefore matches nothing,
        // which is the honest answer: ignoring it would return the unfiltered list and
        // read as a filter that silently does not work.
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = int.TryParse(search, out var referenceId)
                ? query.Where(t => t.ReferenceId == referenceId)
                : query.Where(t => false);
        }

        return await query
            .Include(t => t.TransactionType)
            // TransactionId breaks ties: CreatedAt is stamped from a single UtcNow, so
            // rows written in one operation share a timestamp and would otherwise swap
            // places between requests.
            .OrderByDescending(t => t.CreatedAt)
            .ThenByDescending(t => t.TransactionId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
    }
}
