using Constants;
using Data;
using Dtos.Responses;
using Microsoft.EntityFrameworkCore;

namespace Services;

public class StatsService
{
    private readonly LoanAppDbContext _context;

    private const int TrendMonths = 5;

    public StatsService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetDashboardAsync (
        int tenantId, DashboardAudience audience, int days)
    {
        var today = DateTime.UtcNow.Date;
        var from = today.AddDays(-(days - 1));
        var toExclusive = today.AddDays(1);

        var pipeline = await BuildPipelineAsync(tenantId, audience);
        var (averageLoanSize, averageTrend) = await BuildTrendAsync(tenantId, today);

        var response = new DashboardStatsResponse
        {
            From = from,
            To = today,
            Days = days,
            Pipeline = pipeline,
            AverageLoanSize = averageLoanSize,
            AverageTrend = averageTrend
        };

        switch (audience)
        {
            case DashboardAudience.Reviewer:
                var reviews = await ReviewSeriesAsync(tenantId, from, toExclusive);
                response.Series = ZeroFill(from, days, reviews);
                response.HeadlineLabel = "Reviews posted";
                response.HeadlineCount = response.Series.Sum(p => p.Count);
                response.HeadlineAmount = response.Series.Sum(p => p.Amount);
                response.HeadlineCaption = Caption(response.HeadlineLabel, days);
                break;

            case DashboardAudience.Approver:
                var approvals = await ApprovedSeriesAsync(tenantId, from, toExclusive);
                response.Series = ZeroFill(from, days, approvals);
                response.HeadlineLabel = "Approved applications";
                response.HeadlineCount = response.Series.Sum(p => p.Count);
                response.HeadlineAmount = response.Series.Sum(p => p.Amount);
                response.HeadlineCaption = Caption(response.HeadlineLabel, days);
                break;

            case DashboardAudience.Admin:
                var payments = await PaymentSeriesAsync(tenantId, from, toExclusive);
                response.Payments = ZeroFill(from, days, payments);
                response.Series = response.Payments;
                response.HeadlineLabel = "Payments collected";
                response.HeadlineCount = response.Payments.Sum(p => p.Count);
                response.HeadlineAmount = response.Payments.Sum(p => p.Amount);
                response.HeadlineCaption = Caption(response.HeadlineLabel, days);
                break;

            default:
                throw new InvalidOperationException($"Unknown dashboard audience '{audience}'.");
        }

        return response;
    }

    public async Task<BorrowerStatsResponse> GetBorrowerDashboardAsync (
        int borrowerUserId, int days)
    {
        var today = DateTime.UtcNow.Date;
        var from = today.AddDays(-(days - 1));
        var toExclusive = today.AddDays(1);

        var payments = await BorrowerPaymentSeriesAsync(borrowerUserId, from, toExclusive);
        var series = ZeroFill(from, days, payments);

        var (averagePayment, trend) = await BorrowerTrendAsync(borrowerUserId, today);

        var loans = await _context.Loans
            .Where(l => l.BorrowerId == borrowerUserId)
            .Include(l => l.Status)
            .ToListAsync();

        var openLoans = loans.Where(l => l.Status.Code != LoanLifecycleCodes.Paid).ToList();

        var behindBy = openLoans.Sum(l => LoanStanding.For(l, today).BehindBy);

        var count = series.Sum(p => p.Count);
        var amount = series.Sum(p => p.Amount);

        const string headlineLabel = "Payments you made";

        return new BorrowerStatsResponse
        {
            From = from,
            To = today,
            Days = days,
            HeadlineLabel = headlineLabel,
            HeadlineAmount = amount,
            HeadlineCount = count,
            HeadlineCaption = Caption(headlineLabel, days),
            Series = series,
            AveragePayment = averagePayment,
            AverageTrend = trend,
            HasLoan = loans.Count > 0,
            Outstanding = openLoans.Sum(l => l.Balance),
            BehindBy = behindBy,
            NextDueDate = openLoans.Count == 0 ? null : openLoans.Min(l => l.DueDate)
        };
    }


    private async Task<List<DayBucket>> ReviewSeriesAsync (int tenantId, DateTime from, DateTime toExclusive)
    {
        var rows = await _context.ReviewApplications
            .Where(r => r.LoanApplication.Borrower.TenantId == tenantId
                     && r.DatePosted >= from
                     && r.DatePosted < toExclusive)
            .GroupBy(r => r.DatePosted.Date)
            .Select(g => new { Day = g.Key, Count = g.Count(), Amount = g.Sum(r => r.LoanApplication.Amount) })
            .ToListAsync();

        return rows.Select(r => new DayBucket(r.Day, r.Count, r.Amount)).ToList();
    }

    private async Task<List<DayBucket>> ApprovedSeriesAsync (int tenantId, DateTime from, DateTime toExclusive)
    {
        var rows = await _context.LoanApprovals
            .Where(a => a.LoanApplication.Borrower.TenantId == tenantId
                     && a.Status.Code == LoanApplicationStatusCodes.Approved
                     && a.ApprovalDate >= from
                     && a.ApprovalDate < toExclusive)
            .GroupBy(a => a.ApprovalDate.Date)
            .Select(g => new { Day = g.Key, Count = g.Count(), Amount = g.Sum(a => a.PrincipalAmount) })
            .ToListAsync();

        return rows.Select(r => new DayBucket(r.Day, r.Count, r.Amount)).ToList();
    }

    private async Task<List<DayBucket>> PaymentSeriesAsync (int tenantId, DateTime from, DateTime toExclusive)
    {
        var rows = await _context.Payments
            .Where(p => p.Loan.Borrower.TenantId == tenantId
                     && p.PaymentDate >= from
                     && p.PaymentDate < toExclusive)
            .GroupBy(p => p.PaymentDate.Date)
            .Select(g => new { Day = g.Key, Count = g.Count(), Amount = g.Sum(p => p.Amount) })
            .ToListAsync();

        return rows.Select(r => new DayBucket(r.Day, r.Count, r.Amount)).ToList();
    }

    private async Task<List<DayBucket>> BorrowerPaymentSeriesAsync (
        int borrowerUserId, DateTime from, DateTime toExclusive)
    {
        var rows = await _context.Payments
            .Where(p => p.BorrowerUserId == borrowerUserId
                     && p.PaymentDate >= from
                     && p.PaymentDate < toExclusive)
            .GroupBy(p => p.PaymentDate.Date)
            .Select(g => new { Day = g.Key, Count = g.Count(), Amount = g.Sum(p => p.Amount) })
            .ToListAsync();

        return rows.Select(r => new DayBucket(r.Day, r.Count, r.Amount)).ToList();
    }

    private async Task<(decimal Average, List<MonthlyBarResponse> Trend)> BorrowerTrendAsync (
        int borrowerUserId, DateTime today)
    {
        var trendFrom = new DateTime(today.Year, today.Month, 1).AddMonths(-(TrendMonths - 1));

        var rows = await _context.Payments
            .Where(p => p.BorrowerUserId == borrowerUserId && p.PaymentDate >= trendFrom)
            .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Average = g.Average(p => p.Amount) })
            .ToListAsync();

        var byMonth = rows.ToDictionary(r => (r.Year, r.Month), r => r.Average);

        var trend = Enumerable.Range(0, TrendMonths)
            .Select(offset =>
            {
                var month = trendFrom.AddMonths(offset);

                return new MonthlyBarResponse
                {
                    Year = month.Year,
                    Month = month.Month,
                    Amount = byMonth.TryGetValue((month.Year, month.Month), out var hit) ? hit : 0m
                };
            })
            .ToList();

        var withValue = trend.Where(t => t.Amount > 0m).ToList();
        var average = withValue.Count > 0 ? withValue.Average(t => t.Amount) : 0m;

        return (average, trend);
    }

    private static List<DailyPointResponse> ZeroFill (DateTime from, int days, List<DayBucket> rows)
    {
        var byDay = rows.ToDictionary(r => r.Day.Date);

        return Enumerable.Range(0, days)
            .Select(offset =>
            {
                var day = from.AddDays(offset);

                return byDay.TryGetValue(day, out var hit)
                    ? new DailyPointResponse { Date = day, Count = hit.Count, Amount = hit.Amount }
                    : new DailyPointResponse { Date = day, Count = 0, Amount = 0m };
            })
            .ToList();
    }


    private async Task<List<PipelineMetricResponse>> BuildPipelineAsync (int tenantId, DashboardAudience audience)
    {
        var byStatus = await _context.LoanApplications
            .Where(l => l.Borrower.TenantId == tenantId)
            .GroupBy(l => l.Status.Code)
            .Select(g => new { Code = g.Key, Count = g.Count(), Amount = g.Sum(l => l.Amount) })
            .ToListAsync();

        var applications = byStatus.ToDictionary(s => s.Code, s => (s.Count, s.Amount));

        PipelineMetricResponse FromApplications (string key, string label, string code)
        {
            var hit = applications.TryGetValue(code, out var found) ? found : (0, 0m);

            return new PipelineMetricResponse
            {
                Key = key,
                Label = label,
                Count = hit.Item1,
                Amount = hit.Item2
            };
        }

        switch (audience)
        {
            case DashboardAudience.Reviewer:
                return
                [
                    FromApplications("awaitingReview", "Awaiting review", LoanApplicationStatusCodes.PendingReview),
                    FromApplications("sentToApproval", "Sent to approval", LoanApplicationStatusCodes.PendingApproval),
                    FromApplications("returned", "Returned", LoanApplicationStatusCodes.ReturnedByReviewer),
                    FromApplications("rejected", "Rejected", LoanApplicationStatusCodes.Rejected)
                ];

            case DashboardAudience.Approver:
                var approved = await _context.LoanApprovals
                    .Where(a => a.LoanApplication.Borrower.TenantId == tenantId
                             && a.Status.Code == LoanApplicationStatusCodes.Approved)
                    .GroupBy(a => 1)
                    .Select(g => new { Count = g.Count(), Amount = g.Sum(a => a.PrincipalAmount) })
                    .FirstOrDefaultAsync();

                return
                [
                    FromApplications("awaitingApproval", "Awaiting approval", LoanApplicationStatusCodes.PendingApproval),
                    new PipelineMetricResponse
                    {
                        Key = "approved",
                        Label = "Approved",
                        Count = approved?.Count ?? 0,
                        Amount = approved?.Amount ?? 0m
                    },
                    FromApplications("rejected", "Rejected", LoanApplicationStatusCodes.Rejected),
                    FromApplications("released", "Released", LoanApplicationStatusCodes.Released)
                ];

            case DashboardAudience.Admin:
                var activeLoans = await _context.Loans
                    .Where(l => l.Borrower.TenantId == tenantId
                             && l.Status.Code != LoanLifecycleCodes.Paid)
                    .GroupBy(l => 1)
                    .Select(g => new { Count = g.Count(), Amount = g.Sum(l => l.Balance) })
                    .FirstOrDefaultAsync();

                var ledger = await _context.Ledgers
                    .FirstOrDefaultAsync(l => l.TenantId == tenantId);

                return
                [
                    FromApplications("awaitingRelease", "Awaiting release", LoanApplicationStatusCodes.PendingRelease),
                    FromApplications("released", "Released", LoanApplicationStatusCodes.Released),
                    new PipelineMetricResponse
                    {
                        Key = "activeLoans",
                        Label = "Active loans",
                        Count = activeLoans?.Count ?? 0,
                        Amount = activeLoans?.Amount ?? 0m
                    },
                    new PipelineMetricResponse
                    {
                        Key = "capital",
                        Label = "Capital on hand",
                        Count = 0,
                        Amount = ledger?.CurrentBalance ?? 0m
                    }
                ];

            default:
                throw new InvalidOperationException($"Unknown dashboard audience '{audience}'.");
        }
    }


    private async Task<(decimal Average, List<MonthlyBarResponse> Trend)> BuildTrendAsync (int tenantId, DateTime today)
    {
        var trendFrom = new DateTime(today.Year, today.Month, 1).AddMonths(-(TrendMonths - 1));

        var rows = await _context.LoanApprovals
            .Where(a => a.LoanApplication.Borrower.TenantId == tenantId
                     && a.Status.Code == LoanApplicationStatusCodes.Approved
                     && a.ApprovalDate >= trendFrom)
            .GroupBy(a => new { a.ApprovalDate.Year, a.ApprovalDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Average = g.Average(a => a.PrincipalAmount) })
            .ToListAsync();

        var byMonth = rows.ToDictionary(r => (r.Year, r.Month), r => r.Average);

        var trend = Enumerable.Range(0, TrendMonths)
            .Select(offset =>
            {
                var month = trendFrom.AddMonths(offset);

                return new MonthlyBarResponse
                {
                    Year = month.Year,
                    Month = month.Month,
                    Amount = byMonth.TryGetValue((month.Year, month.Month), out var hit) ? hit : 0m
                };
            })
            .ToList();

        var withValue = trend.Where(t => t.Amount > 0m).ToList();
        var average = withValue.Count > 0 ? withValue.Average(t => t.Amount) : 0m;

        return (average, trend);
    }

    private static string Caption (string headlineLabel, int days)
    {
        var window = days == 7 ? "this week" : $"in the last {days} days";
        var noun = char.ToLowerInvariant(headlineLabel[0]) + headlineLabel[1..];

        return $"{noun} {window}";
    }

    private readonly record struct DayBucket(DateTime Day, int Count, decimal Amount);
}
