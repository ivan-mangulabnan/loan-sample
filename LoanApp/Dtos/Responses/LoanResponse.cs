using Models;

namespace Dtos.Responses;

public class LoanResponse
{
    public int LoanId { get; set; }

    public decimal InterestRate { get; set; }
    public int NumberOfMonths { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal TotalRepaymentAmount { get; set; }
    public decimal Balance { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ClosedDate { get; set; }

    public string Status { get; set; } = null!;
    public string? Borrower { get; set; }

    public LoanStandingResponse Standing { get; set; } = null!;

    public static LoanResponse From (Loan loan, DateTime today, bool showGrading) => new()
    {
        LoanId = loan.LoanId,
        InterestRate = loan.InterestRate,
        NumberOfMonths = loan.NumberOfMonths,
        PrincipalAmount = loan.PrincipalAmount,
        TotalRepaymentAmount = loan.TotalRepaymentAmount,
        Balance = loan.Balance,
        StartDate = loan.StartDate,
        DueDate = loan.DueDate,
        ClosedDate = loan.ClosedDate,
        Status = loan.Status.Label,
        Borrower = loan.Borrower is null ? null : PersonName.Of(loan.Borrower),
        Standing = LoanStandingResponse.From(loan, today, showGrading)
    };

    public static List<LoanResponse> From (IEnumerable<Loan> loans, DateTime today, bool showGrading) =>
        loans.Select(loan => From(loan, today, showGrading)).ToList();
}
