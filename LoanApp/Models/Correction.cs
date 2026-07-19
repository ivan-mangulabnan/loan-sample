namespace Models;

public class Correction
{
  public int CorrectionId { get; set; }

  public int CorrectedTransactionId { get; set; }
  public Transaction Transaction { get; set; } = null!;

  public int PostedByUserId { get; set; }
  public User PostedBy { get; set; } = null!;

  public int LedgerId { get; set; }
  public Ledger Ledger { get; set; } = null!;

  public decimal Amount { get; set; }
  public required string Remarks { get; set; }
  public DateTime DatePosted { get; set; }
}