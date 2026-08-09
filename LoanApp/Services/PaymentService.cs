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
