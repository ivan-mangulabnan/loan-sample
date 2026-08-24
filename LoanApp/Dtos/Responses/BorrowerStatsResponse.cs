namespace Dtos.Responses;

public class BorrowerStatsResponse
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int Days { get; set; }

    public string HeadlineLabel { get; set; } = null!;
    public decimal HeadlineAmount { get; set; }
    public int HeadlineCount { get; set; }
    public string HeadlineCaption { get; set; } = null!;

    public List<DailyPointResponse> Series { get; set; } = [];

    public decimal AveragePayment { get; set; }
    public List<MonthlyBarResponse> AverageTrend { get; set; } = [];

    public bool HasLoan { get; set; }
    public decimal Outstanding { get; set; }
    public decimal BehindBy { get; set; }
    public DateTime? NextDueDate { get; set; }
}
