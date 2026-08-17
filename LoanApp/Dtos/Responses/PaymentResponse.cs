using Models;

namespace Dtos.Responses;

public class PaymentResponse
{
    public int PaymentId { get; set; }
    public int LoanId { get; set; }

    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }

    public string? Borrower { get; set; }

    public static PaymentResponse From (Payment payment, bool showBorrower) => new()
    {
        PaymentId = payment.PaymentId,
        LoanId = payment.LoanId,
        Amount = payment.Amount,
        PaymentDate = payment.PaymentDate,
        Borrower = showBorrower ? PersonName.Of(payment.Borrower) : null
    };

    public static List<PaymentResponse> From (IEnumerable<Payment> payments, bool showBorrower) =>
        payments.Select(payment => From(payment, showBorrower)).ToList();
}
