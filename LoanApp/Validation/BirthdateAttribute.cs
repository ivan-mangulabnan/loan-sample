using System.ComponentModel.DataAnnotations;
using Constants;

namespace Validation;

/// <summary>
/// Accepts a birthdate that is in the past and puts the account holder between
/// RegistrationRules.MinAgeYears and MaxAgeYears old.
/// </summary>
/// <remarks>
/// The client checks this too, but the client is not the authority: the API is reachable
/// without it. [Range] cannot express this because the bound is a computed age, not a
/// fixed value.
/// </remarks>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class BirthdateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is not DateTime birthdate) return false;

        var today = DateTime.UtcNow.Date;
        var born = birthdate.Date;

        if (born > today) return false;

        // Whole years only — subtract one when the birthday has not come round yet
        // this year, so someone turning 18 tomorrow is still 17 today.
        var age = today.Year - born.Year;
        if (born > today.AddYears(-age)) age--;

        return age >= RegistrationRules.MinAgeYears && age <= RegistrationRules.MaxAgeYears;
    }
}
