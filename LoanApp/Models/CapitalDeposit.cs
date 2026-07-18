namespace Models;

public class CapitalDeposit
{
  public int CapitalDepositId { get; set; }
  public int PostedByUserId { get; set; }
  public int LedgerId { get; set; }
  public decimal Amount { get; set; }
  public DateTime DatePosted { get; set; }
}