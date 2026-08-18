using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class PaymentQueryRequest
{
  // Null means "do not filter". [Range] is skipped on null and enforced when supplied,
  // so borrowerId=0 is a 400 rather than a filter that silently matches nothing.
  [Range(1, int.MaxValue)]
  public int? BorrowerId { get; set; }

  // Interpreted as whole UTC days by the service. Deliberately no tenantId here — that
  // comes from the signed token and must not be spoofable from the query string.
  public DateTime? From { get; set; }
  public DateTime? To { get; set; }
}
