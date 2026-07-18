namespace Models;

public class Ledger
{
  public int LedgerId { get; set; }
  public int TenantId { get; set; }
  public required string Name { get; set; }
  public decimal CurrentBalance { get; set; }
}