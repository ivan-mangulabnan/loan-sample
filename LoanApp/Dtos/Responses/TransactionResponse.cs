using Models;

namespace Dtos.Responses;

public class TransactionResponse
{
    public int TransactionId { get; set; }

    public string Type { get; set; } = null!;
    public string TypeCode { get; set; } = null!;

    public int ReferenceId { get; set; }

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
