namespace Models;

public class TransactionType
{
    public int TransactionTypeId { get; set; }
    public required string Code { get; set; }
    public required string Label { get; set; }
}