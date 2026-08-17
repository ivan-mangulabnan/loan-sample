namespace Dtos.Responses;

/// <summary>
/// The borrower's own overview. A separate type from DashboardStatsResponse rather than a
/// fourth audience on it: that one carries Pipeline (tenant-wide application counts) and
/// Payments (every borrower's payments), and reusing it would mean remembering to null
/// two fields on every future edit. Here those fields do not exist to leak.
///
/// Every figure is scoped to one BorrowerUserId — see StatsService.
/// </summary>
public class BorrowerStatsResponse
{
    // The window, echoed so the client never recomputes it and can never disagree with
    // the series it is drawing.
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int Days { get; set; }

    // Total paid in the window. Same shape as the staff headline so the client renders
    // the same components.
    public string HeadlineLabel { get; set; } = null!;
    public decimal HeadlineAmount { get; set; }
    public int HeadlineCount { get; set; }
    public string HeadlineCaption { get; set; } = null!;

    // Payments the borrower made, one point per day, zero-filled across the window.
    public List<DailyPointResponse> Series { get; set; } = [];

    // Their average payment across the trend window, and the by-month bars behind it.
    public decimal AveragePayment { get; set; }
    public List<MonthlyBarResponse> AverageTrend { get; set; } = [];

    // Drives the callout, which is the one place the borrower's dashboard has to tell
    // "no loans yet" apart from "a loan with something due". Computed server-side
    // because the client would otherwise re-derive it from /Loan/me and the two answers
    // could disagree.
    public bool HasLoan { get; set; }
    public decimal Outstanding { get; set; }
    public decimal BehindBy { get; set; }
    public DateTime? NextDueDate { get; set; }
}
