using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class StatsQueryRequest
{
  public const int DefaultDays = 7;
  public const int MaxDays = 90;

  // Capped rather than clamped, matching PagedRequest.PageSize: silently serving a
  // different window than the caller asked for makes the headline copy a lie.
  // [ApiController] turns this into a 400.
  [Range(1, MaxDays)]
  public int Days { get; set; } = DefaultDays;

  // Deliberately no tenantId — that comes from the signed token and must not be
  // spoofable from the query string. Deliberately no free from/to either: the headline
  // reads "N approved this week", so the window has to end today or the sentence is
  // wrong. Days is enough for the period selector to grow.
}
