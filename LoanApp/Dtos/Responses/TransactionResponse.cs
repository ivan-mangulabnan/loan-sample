using Models;

namespace Dtos.Responses;

public class TransactionResponse
{
    public int TransactionId { get; set; }

    // Two spellings of the type, on purpose. The table prints Type; the filter dropdown
    // sends TypeCode. Deriving one from the other on the client would be a second
    // vocabulary to keep in step, which is the mistake the status labels already made.
    public string Type { get; set; } = null!;
    public string TypeCode { get; set; } = null!;

    // Untyped by design: it holds a CapitalDepositId, a FundReleaseId or a PaymentId
    // depending on TypeCode, and there is no foreign key to follow. The reader pairs it
    // with the type to know what it points at.
    public int ReferenceId { get; set; }

    // Signed as stored — negative for a release, positive for a deposit or payment. The
    // sign IS the direction, and keeping it is what makes the column sum to the balance.
    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }

    public static TransactionResponse From (Transaction transaction) => new()
    {
        TransactionId = transaction.TransactionId,
        Type = transaction.TransactionType.Label,
        TypeCode = transaction.TransactionType.Code,
        ReferenceId = transaction.ReferenceId,
        Amount = transaction.Amount,
        CreatedAt = transaction.CreatedAt
    };

    public static List<TransactionResponse> From (IEnumerable<Transaction> transactions) =>
        transactions.Select(From).ToList();
}
