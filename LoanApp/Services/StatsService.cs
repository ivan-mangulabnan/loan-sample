using Constants;
using Data;
using Dtos.Responses;
using Microsoft.EntityFrameworkCore;

namespace Services;

public class StatsService
{
    private readonly LoanAppDbContext _context;

    // Five buckets to match the sidebar's five bars.
    private const int TrendMonths = 5;

    // No LedgerService: the capital figure is one FirstOrDefault on a tenant-scoped
    // column, and GetOperatingLedgerAsync throws when a tenant has no ledger — which is
    // right for a transfer but wrong for a dashboard tile that should read zero.
    public StatsService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetDashboardAsync (
        int tenantId, DashboardAudience audience, int days)
    {
        // Whole UTC days. ApprovalDate, DatePosted and PaymentDate are all stamped from
        // DateTime.UtcNow and stored as datetime2 with no offset, so "today" is the UTC
        // day. Documented rather than converted: there is no per-tenant timezone column
        // to convert to, and inventing one would silently disagree with /admin/payments,
        // which already buckets on UTC days (PaymentService.GetFilteredAsync).
        var today = DateTime.UtcNow.Date;
        var from = today.AddDays(-(days - 1));
        // Exclusive upper bound, same reason as PaymentService: `<= today` would drop
        // everything stamped later in the day, since these columns carry a time.
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
                response.HeadlineLabel = "Approved value";
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

    /// <summary>
    /// The borrower's own overview. A separate entry point rather than a fourth case on
    /// GetDashboardAsync: every query below is scoped by borrowerUserId as well as the
    /// tenant, and folding it into the staff switch would mean one forgotten filter
    /// serves the whole tenant's money to a borrower. The signature makes that
    /// impossible — the staff method has no user id to forget.
    /// </summary>
    public async Task<BorrowerStatsResponse> GetBorrowerDashboardAsync (
        int borrowerUserId, int days)
    {
        var today = DateTime.UtcNow.Date;
        var from = today.AddDays(-(days - 1));
        var toExclusive = today.AddDays(1);

        var payments = await BorrowerPaymentSeriesAsync(borrowerUserId, from, toExclusive);
        var series = ZeroFill(from, days, payments);

        var (averagePayment, trend) = await BorrowerTrendAsync(borrowerUserId, today);

        // Loans are read whole rather than aggregated in SQL: BehindBy comes from
        // LoanStanding.For, the same calculation /Loan/me reports, so the callout and
        // the loans page can never quote different numbers. A borrower holds a handful
        // of loans, so materialising them is cheap.
        var loans = await _context.Loans
            .Where(l => l.BorrowerId == borrowerUserId)
            .Include(l => l.Status)
            .ToListAsync();

        var openLoans = loans.Where(l => l.Status.Code != LoanLifecycleCodes.Paid).ToList();

        var behindBy = openLoans.Sum(l => LoanStanding.For(l, today).BehindBy);

        var count = series.Sum(p => p.Count);
        var amount = series.Sum(p => p.Amount);

        // Named once and used twice: the caption is the label plus the window, so a
        // literal in both places is two copies of one string waiting to disagree.
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
            // Any loan at all, settled ones included: someone who has paid a loan off is
            // not a first-time applicant, and the callout should not greet them as one.
            HasLoan = loans.Count > 0,
            Outstanding = openLoans.Sum(l => l.Balance),
            BehindBy = behindBy,
            NextDueDate = openLoans.Count == 0 ? null : openLoans.Min(l => l.DueDate)
        };
    }

    // ---- Series ------------------------------------------------------------------

    // Reviews carry the application's requested amount so the series has a money value
    // as well as a count; a reviewer's headline uses the count.
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

    // Two tenant hops: LoanApproval has no Borrower navigation of its own.
    //
    // The status filter is load-bearing. A rejected decision also writes a LoanApproval
    // row with PrincipalAmount populated, so summing without it overstates approved
    // value by the rejected volume. Note this reads the APPROVAL's status, not the
    // application's — after approval the application moves on to PENDING_RELEASE and
    // then RELEASED, so filtering on the application here would return nothing.
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

    // Payments reach the tenant through Loan — two hops. BorrowerUserId exists on
    // Payment but is a filter column, not the tenancy path.
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

    // Scoped by BorrowerUserId alone — it is a direct column on Payment, and a user id
    // is already unique across tenants, so the Loan->Borrower->Tenant hop the staff
    // queries need would narrow nothing here.
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

    // The borrower's average payment by month, mirroring the staff trend's shape so the
    // same BarChart renders it.
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

        // Averaged over months that actually had a payment: including empty months would
        // halve the figure for someone who simply started paying recently.
        var withValue = trend.Where(t => t.Amount > 0m).ToList();
        var average = withValue.Count > 0 ? withValue.Average(t => t.Amount) : 0m;

        return (average, trend);
    }

    /// <summary>
    /// Left-joins the sparse SQL result onto a dense calendar. This is why the grouped
    /// queries are materialised first — Enumerable.Range has no SQL translation, and
    /// without it the client receives one point for a seven-day window and has to
    /// reconstruct the axis itself, which is where an off-by-one shifts every bar a day.
    /// </summary>
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

    // ---- Pipeline ----------------------------------------------------------------

    private async Task<List<PipelineMetricResponse>> BuildPipelineAsync (int tenantId, DashboardAudience audience)
    {
        // One round-trip covering every status, sliced per audience afterwards. Four
        // separate CountAsync calls would race each other into an inconsistent snapshot,
        // and the status set is small and fixed.
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
                // Approved comes from the approvals table, not the applications table:
                // an approved application has already moved on to PENDING_RELEASE.
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
                             // Code, not Label: the code is PAID while the label reads
                             // "Fully Paid". Matching the label here would never hit.
                             && l.Status.Code != LoanLifecycleCodes.Paid)
                    .GroupBy(l => 1)
                    .Select(g => new { Count = g.Count(), Amount = g.Sum(l => l.Balance) })
                    .FirstOrDefaultAsync();

                // The ledger is the one entity with a direct TenantId column.
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

    // ---- Average loan size trend -------------------------------------------------

    private async Task<(decimal Average, List<MonthlyBarResponse> Trend)> BuildTrendAsync (int tenantId, DateTime today)
    {
        var trendFrom = new DateTime(today.Year, today.Month, 1).AddMonths(-(TrendMonths - 1));

        // Grouped on year AND month: month alone collides last January with this one.
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

        // Guarded: Average() throws on an empty sequence, which is exactly the state of
        // a tenant that has never approved anything.
        var withValue = trend.Where(t => t.Amount > 0m).ToList();
        var average = withValue.Count > 0 ? withValue.Average(t => t.Amount) : 0m;

        return (average, trend);
    }

    /// <summary>
    /// The words that follow the headline figure, forming one sentence with it:
    /// "5 reviews posted this week". It names what the figure *is* and never restates
    /// it — "5" over "5 reviewed this week" said the same thing twice and still never
    /// answered "five of what".
    ///
    /// Built from HeadlineLabel so the noun and the figure it describes cannot drift
    /// apart. The leading capital is dropped because this is a sentence tail, not a
    /// heading; HeadlineLabel keeps its own casing for standalone use. Only the window
    /// phrasing is decided here, because that is copy — and copy is the server's, the
    /// same way the headline's meaning is.
    /// </summary>
    private static string Caption (string headlineLabel, int days)
    {
        var window = days == 7 ? "this week" : $"in the last {days} days";
        var noun = char.ToLowerInvariant(headlineLabel[0]) + headlineLabel[1..];

        return $"{noun} {window}";
    }

    private readonly record struct DayBucket(DateTime Day, int Count, decimal Amount);
}
