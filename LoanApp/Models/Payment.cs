namespace Models;

public class Payment
{
    public int PaymentId { get; set; }
    
    public int BorrowerUserId { get; set; }
    public User Borrower { get; set; } = null!;

    public int LoanId { get; set; }
    public Loan Loan { get; set; } = null!;

    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
}