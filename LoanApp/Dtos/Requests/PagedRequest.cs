using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class PagedRequest
{
  public const int MaxPageSize = 100;
  public const int DefaultPageSize = 20;

  [Range(1, int.MaxValue)]
  public int Page { get; set; } = 1;

  // Capped rather than clamped: silently trimming a request for 10,000 rows returns 200
  // and leaves the client paging forever. [ApiController] turns this into a 400.
  [Range(1, MaxPageSize)]
  public int PageSize { get; set; } = DefaultPageSize;

  // Computed, not bound — Page is 1-based for the caller and this is the one conversion.
  public int Skip => (Page - 1) * PageSize;
}
