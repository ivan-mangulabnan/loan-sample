namespace Constants;

public static class RegistrationRules
{
    // Legal capacity to enter a loan contract. Mirrored on the client in
    // loan-web/src/lib/dates.js (MIN_AGE_YEARS) — the two must move together.
    public const int MinAgeYears = 18;

    // Not a legal rule, just a floor for typos: a mistyped century (1025) should
    // read as a bad date rather than an implausible customer.
    public const int MaxAgeYears = 120;
}
