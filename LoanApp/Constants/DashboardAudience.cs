namespace Constants;

/// <summary>
/// Which overview to build. Deliberately not RoleNames: a bare string role invites a
/// typo'd comparison, and an enum keeps every switch in StatsService exhaustive.
///
/// Borrower is the odd one out and stays that way on purpose. The three staff audiences
/// read the whole tenant; Borrower reads one user's own rows and is the only value that
/// requires a user id alongside the tenant — see StatsService.GetBorrowerDashboardAsync,
/// which is a separate entry point rather than a fourth case, so a staff query can never
/// fall through to it unscoped.
/// </summary>
public enum DashboardAudience
{
    Reviewer,
    Approver,
    Admin,
    Borrower
}
