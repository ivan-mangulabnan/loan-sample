using Models;
using Services;

namespace Dtos.Responses;

public class LoanStandingResponse
{
    public decimal DailyAmortisation { get; set; }
    public int DaysRemaining { get; set; }
    public decimal ExpectedPaidToDate { get; set; }
    public decimal ActuallyPaid { get; set; }
    public decimal BehindBy { get; set; }

    public int? DaysBehind { get; set; }
    public string? Grade { get; set; }
    public bool? IsGoodPayer { get; set; }

    public static LoanStandingResponse From (Loan loan, DateTime today, bool showGrading)
    {
        var figures = LoanStanding.For(loan, today);

        return new LoanStandingResponse
        {
            DailyAmortisation = figures.DailyAmortisation,
            DaysRemaining = figures.DaysRemaining,
            ExpectedPaidToDate = figures.ExpectedPaidToDate,
            ActuallyPaid = figures.ActuallyPaid,
            BehindBy = figures.BehindBy,
            DaysBehind = showGrading ? figures.DaysBehind : null,
            Grade = showGrading ? figures.Grade : null,
            IsGoodPayer = showGrading ? figures.IsGoodPayer : null
        };
    }
}
