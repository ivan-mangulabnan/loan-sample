using System.Security.Claims;

namespace Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    public static int GetTenantId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue("tenantId")!);
    }
}
