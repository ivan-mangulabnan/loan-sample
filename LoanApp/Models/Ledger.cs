namespace Models;

public class Ledger
{
  public int LedgerId { get; set; }

  public int TenantId { get; set; }
  public Tenant Tenant { get; set; } = null!;
  public ICollection<Transaction> Transactions = new List<Transaction>();
  
  public required string Name { get; set; }
  public decimal CurrentBalance { get; set; }
}