using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class PaymentQueryRequest
{
  [Range(1, int.MaxValue)]
  public int? BorrowerId { get; set; }

  public DateTime? From { get; set; }
  public DateTime? To { get; set; }
}
