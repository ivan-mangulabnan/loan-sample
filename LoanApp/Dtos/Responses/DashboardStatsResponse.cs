namespace Dtos.Responses;

public class DailyPointResponse
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class PipelineMetricResponse
{
    public string Key { get; set; } = null!;
    public string Label { get; set; } = null!;

    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class MonthlyBarResponse
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Amount { get; set; }
}

public class DashboardStatsResponse
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int Days { get; set; }

    public string HeadlineLabel { get; set; } = null!;
    public decimal HeadlineAmount { get; set; }
    public int HeadlineCount { get; set; }
    public string HeadlineCaption { get; set; } = null!;

    public List<DailyPointResponse> Series { get; set; } = [];

    public List<PipelineMetricResponse> Pipeline { get; set; } = [];

    public List<DailyPointResponse>? Payments { get; set; }

    public decimal AverageLoanSize { get; set; }
    public List<MonthlyBarResponse> AverageTrend { get; set; } = [];
}
