namespace Models;

public class Payment
{
    public int PaymentId { get; set; }
    public int BorrowerUserId { get; set; }
    public int LoanId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
}