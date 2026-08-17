namespace Constants;

public static class LoanLifecycleCodes
{
    public const string Active = "ACTIVE";
    public const string Paid = "PAID";
    public const string Overdue = "OVERDUE";
    public const string Defaulted = "DEFAULTED";

    public static readonly string[] All = [Active, Paid, Overdue, Defaulted];

    public static readonly string[] Terminal = [Paid, Defaulted];
}
