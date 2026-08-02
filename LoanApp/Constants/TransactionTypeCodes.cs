namespace Constants;

public static class TransactionTypeCodes
{
    public const string CapitalDeposit = "CAPITAL_DEPOSIT";
    public const string Correction = "CORRECTION";
    public const string FundRelease = "FUND_RELEASE";
    public const string Payment = "PAYMENT";

    public static readonly string[] All = [CapitalDeposit, Correction, FundRelease, Payment];
}
