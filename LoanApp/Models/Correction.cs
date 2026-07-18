namespace Models;

public class Correction
{
  public int CorrectionId { get; set; }
  public int CorrectedTransactionId { get; set; }
  public int PostedByUserId { get; set; }
  public int LedgerId { get; set; }
  public decimal Amount { get; set; }
  public required string Remarks { get; set; }
  public DateTime DatePosted { get; set; }
}