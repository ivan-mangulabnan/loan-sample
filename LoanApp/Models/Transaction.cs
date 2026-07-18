namespace Models;

public class Transaction
{
    public int TransactionId { get; set; }
    public int LedgerId { get; set; }
    public int TransactionTypeId { get; set; }
    public int ReferenceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}