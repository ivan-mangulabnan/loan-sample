namespace Models;

public class Transaction
{
    public int TransactionId { get; set; }

    public int LedgerId { get; set; }
    public Ledger Ledger { get; set; } = null!;

    public int TransactionTypeId { get; set; }
    public TransactionType TransactionType { get; set; } = null!;

    public int ReferenceId { get; set; }

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }
}