namespace Constants;

public static class LoanGradeCodes
{
    public const string Delayed = "DELAYED";
    public const string Good = "GOOD";
    public const string Great = "GREAT";
    public const string SettledOnTime = "SETTLED_ON_TIME";
    public const string SettledLate = "SETTLED_LATE";

    public const decimal DelayedAtDaysBehind = 2m;
    public const decimal GreatAboveDaysAhead = 2m;
}
