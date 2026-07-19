namespace Models;

public class Loan
{
    public int LoanId { get; set; }

    public int FundReleaseId { get; set; }
    public FundRelease FundRelease { get; set; } = null!;

    public int BorrowerId { get; set; }
    public User Borrower { get; set; } = null!;
    
    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public required decimal InterestRate { get; set; }
    public required int NumberOfMonths { get; set; }
    public required decimal PrincipalAmount { get; set; }
    public required decimal TotalRepaymentAmount { get; set; }
    public decimal Balance { get; set; }

    public required DateTime StartDate { get; set; }
    public required DateTime DueDate { get; set; }
}