using System.Security.Claims;
using Constants;

namespace Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId (this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    public static int GetTenantId (this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue("tenantId")!);
    }

    public static bool CanSeeStaffNames (this ClaimsPrincipal user)
    {
        return !user.IsInRole(RoleNames.Loaner);
    }

    public static bool CanSeeLoanGrading (this ClaimsPrincipal user)
    {
        return !user.IsInRole(RoleNames.Loaner);
    }

    public static DashboardAudience GetDashboardAudience (this ClaimsPrincipal user)
    {
        if (user.IsInRole(RoleNames.Admin)) return DashboardAudience.Admin;
        if (user.IsInRole(RoleNames.Approver)) return DashboardAudience.Approver;
        if (user.IsInRole(RoleNames.Reviewer)) return DashboardAudience.Reviewer;

        throw new InvalidOperationException("No staff dashboard for this role.");
    }
}
