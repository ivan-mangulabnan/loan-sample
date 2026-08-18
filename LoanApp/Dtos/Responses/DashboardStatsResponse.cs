namespace Dtos.Responses;

// One point per day in the window. Always exactly `Days` long and always contiguous —
// zero-filled in the service, because a SQL day-group only returns days that HAVE rows
// and the client would otherwise have to rebuild the calendar to draw an axis.
public class DailyPointResponse
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class PipelineMetricResponse
{
    // Stable identifier for the client (icon/tone lookup); Label is display copy.
    public string Key { get; set; } = null!;
    public string Label { get; set; } = null!;

    public int Count { get; set; }
    public decimal Amount { get; set; }
}

// Average approved principal for one month. Month is an int, not a letter: deriving
// "J" here would push presentation into the API.
public class MonthlyBarResponse
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Amount { get; set; }
}

public class DashboardStatsResponse
{
    // The window, echoed back so the client never recomputes it and can never disagree
    // with the series it is drawing.
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int Days { get; set; }

    // The meaning is role-specific (reviews posted / principal approved / payments
    // collected) but the shape never varies, so the client renders one component.
    //
    // Amount and Count are both filled for every role; the client's roleConfig decides
    // which one is the figure on screen, because that is formatting and formatting is
    // the client's. Caption is HeadlineLabel plus the window, lower-cased: the client
    // renders it directly after the figure as one sentence — "5 reviews posted this
    // week" — so it names the figure and never restates it.
    public string HeadlineLabel { get; set; } = null!;
    public decimal HeadlineAmount { get; set; }
    public int HeadlineCount { get; set; }
    public string HeadlineCaption { get; set; } = null!;

    public List<DailyPointResponse> Series { get; set; } = [];

    public List<PipelineMetricResponse> Pipeline { get; set; } = [];

    // Admin only, and null rather than empty for everyone else: [] would read as "Admin
    // with no payments", which is a real and different state. The query behind this is
    // never executed for a non-Admin — see StatsService.
    public List<DailyPointResponse>? Payments { get; set; }

    public decimal AverageLoanSize { get; set; }
    public List<MonthlyBarResponse> AverageTrend { get; set; } = [];
}
