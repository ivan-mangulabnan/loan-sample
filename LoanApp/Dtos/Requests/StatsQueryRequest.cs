using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class StatsQueryRequest
{
  public const int DefaultDays = 7;
  public const int MaxDays = 90;

  [Range(1, MaxDays)]
  public int Days { get; set; } = DefaultDays;

}
