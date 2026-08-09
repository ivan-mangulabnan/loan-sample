using Constants;
using Models;

namespace Services;

public class LoanStandingFigures
{
    public decimal DailyAmortisation { get; set; }
    public int DaysRemaining { get; set; }
    public decimal ExpectedPaidToDate { get; set; }
    public decimal ActuallyPaid { get; set; }
    public decimal BehindBy { get; set; }
    public int DaysBehind { get; set; }
    public string Grade { get; set; } = null!;
    public bool? IsGoodPayer { get; set; }
}

public static class LoanStanding
{
    public static LoanStandingFigures For (Loan loan, DateTime today)
    {
        var asOf = today.Date;
        var totalDays = (loan.DueDate.Date - loan.StartDate.Date).Days;
        var daysRemaining = (loan.DueDate.Date - asOf).Days;
        var daysElapsed = Math.Clamp((asOf - loan.StartDate.Date).Days, 0, Math.Max(totalDays, 0));

        var dailyAmortisation =
              loan.Balance <= 0m ? 0m
            : daysRemaining <= 0 ? loan.Balance
            : loan.Balance / daysRemaining;

        var expectedPaidToDate = totalDays <= 0
            ? loan.TotalRepaymentAmount
            : loan.TotalRepaymentAmount * daysElapsed / totalDays;

        var actuallyPaid = loan.TotalRepaymentAmount - loan.Balance;

        var openRate = totalDays <= 0 ? 0m : loan.TotalRepaymentAmount / totalDays;
        var daysOffSchedule = openRate <= 0m ? 0m : (actuallyPaid - expectedPaidToDate) / openRate;

        var isGoodPayer = Verdict(loan);

        return new LoanStandingFigures
        {
            DailyAmortisation = Round(dailyAmortisation),
            DaysRemaining = daysRemaining,
            ExpectedPaidToDate = Round(expectedPaidToDate),
            ActuallyPaid = actuallyPaid,
            BehindBy = Math.Max(0m, Round(expectedPaidToDate) - actuallyPaid),
            DaysBehind = daysOffSchedule >= 0m ? 0 : (int)Math.Floor(-daysOffSchedule),
            Grade = GradeOf(daysOffSchedule, isGoodPayer),
            IsGoodPayer = isGoodPayer
        };
    }

    private static bool? Verdict (Loan loan)
    {
        if (loan.ClosedDate is null || loan.Balance > 0m) return null;

        return loan.ClosedDate.Value.Date <= loan.DueDate.Date;
    }

    private static string GradeOf (decimal daysOffSchedule, bool? isGoodPayer)
    {
        if (isGoodPayer is not null)
            return isGoodPayer.Value ? LoanGradeCodes.SettledOnTime : LoanGradeCodes.SettledLate;

        if (daysOffSchedule <= -LoanGradeCodes.DelayedAtDaysBehind) return LoanGradeCodes.Delayed;

        return daysOffSchedule > LoanGradeCodes.GreatAboveDaysAhead
            ? LoanGradeCodes.Great
            : LoanGradeCodes.Good;
    }

    private static decimal Round (decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
