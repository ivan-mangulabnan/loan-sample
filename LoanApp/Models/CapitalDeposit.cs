namespace Models;

public class CapitalDeposit
{
  public int CapitalDepositId { get; set; }
  
  public int LedgerId { get; set; }
  public Ledger Ledger { get; set; } = null!;

  public int PostedByUserId { get; set; }
  public User PostedBy { get; set; } = null!;

  public decimal Amount { get; set; }
  public DateTime DatePosted { get; set; }
}