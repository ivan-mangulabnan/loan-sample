using Models;

namespace Dtos.Responses;

public static class PersonName
{
    public static string Of (User user)
    {
        if (user.Account is null) return user.UserName;

        var parts = new[] { user.Account.FirstName, user.Account.MiddleName, user.Account.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part));

        return string.Join(" ", parts);
    }
}
