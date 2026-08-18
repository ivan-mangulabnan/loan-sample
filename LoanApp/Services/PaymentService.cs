using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class PaymentService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;
    private readonly LedgerService _ledgerService;

    public PaymentService (LoanAppDbContext context, StatusService statusService, LedgerService ledgerService)
    {
        _context = context;
        _statusService = statusService;
        _ledgerService = ledgerService;
    }

    // Returns null when the loan is not visible to the caller, and an empty list when it is
    // visible but has no payments yet. Collapsing the two would turn a 404 into 200-with-[],
    // and would make the ownership test vacuous — an empty list proves nothing on its own.
    public async Task<List<Payment>?> GetForLoanAsync (int loanId, int tenantId, int requesterId, bool isStaff)
    {
        var loanIsVisible = await _context.Loans.AnyAsync(
            l => l.LoanId == loanId
              && l.Borrower.TenantId == tenantId
              && (isStaff || l.BorrowerId == requesterId));

        if (!loanIsVisible) return null;

        // No Includes: the caller maps with showBorrower: false, so PersonName.Of is never
        // reached and loading Borrower would be a wasted join.
        return await _context.Payments
            .Where(p => p.LoanId == loanId)
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.PaymentId)
            .ToListAsync();
    }

    // Tenant comes from the caller's token, never the query string. Returns the filtered
    // list whole, up to ListLimit.MaxRows — the client pages it.
    public async Task<List<Payment>> GetFilteredAsync (
        int tenantId, int? borrowerId, DateTime? from, DateTime? to)
    {
        var query = _context.Payments.Where(p => p.Loan.Borrower.TenantId == tenantId);

        if (borrowerId is not null)
            query = query.Where(p => p.BorrowerUserId == borrowerId.Value);

        // Whole UTC days. The upper bound is exclusive on the next day: `<= to` would drop
        // payments made later in the day on the `to` date, since PaymentDate carries a time.
        if (from is not null)
        {
            var fromDate = from.Value.Date;
            query = query.Where(p => p.PaymentDate >= fromDate);
        }

        if (to is not null)
        {
            var toExclusive = to.Value.Date.AddDays(1);
            query = query.Where(p => p.PaymentDate < toExclusive);
        }

        return await query
            .Include(p => p.Borrower).ThenInclude(b => b.Account)
            // PaymentId breaks ties: PostAsync stamps PaymentDate from a single UtcNow, so
            // batch-posted payments share one timestamp and would otherwise swap places
            // between requests.
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.PaymentId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
    }

    public async Task<Payment?> PostAsync (int borrowerId, PaymentRequest paymentRequest)
    {
        var loan = await _context.Loans
            .Include(l => l.Borrower)
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanId == paymentRequest.LoanId && l.BorrowerId == borrowerId);

        if (loan is null) return null;

        if (LoanLifecycleCodes.Terminal.Contains(loan.Status.Code))
            throw new InvalidOperationException($"Cannot post a payment to a loan with status '{loan.Status.Code}'.");

        var amount = paymentRequest.Amount;

        if (amount > loan.Balance)
            throw new InvalidOperationException(
                $"Payment of {amount:N2} exceeds the outstanding balance of {loan.Balance:N2}.");

        var ledger = await _ledgerService.GetOperatingLedgerAsync(loan.Borrower.TenantId);
        var transactionTypeId = await _ledgerService.GetTransactionTypeIdAsync(TransactionTypeCodes.Payment);
        var postedAt = DateTime.UtcNow;

        var payment = new Payment
        {
            LoanId = loan.LoanId,
            BorrowerUserId = loan.BorrowerId,
            Amount = amount,
            PaymentDate = postedAt
        };

        await using var databaseTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _context.Transactions.Add(new Transaction
            {
                LedgerId = ledger.LedgerId,
                TransactionTypeId = transactionTypeId,
                ReferenceId = payment.PaymentId,
                Amount = amount,
                CreatedAt = postedAt
            });

            ledger.CurrentBalance += amount;
            loan.Balance -= amount;

            if (loan.Balance == 0m)
            {
                var paid = await _statusService.GetRequiredLoanStatusAsync(LoanLifecycleCodes.Paid);

                loan.StatusId = paid.StatusId;
                loan.ClosedDate = postedAt;
            }

            await _context.SaveChangesAsync();

            await databaseTransaction.CommitAsync();
        }
        catch
        {
            await databaseTransaction.RollbackAsync();
            throw;
        }

        return payment;
    }
}
