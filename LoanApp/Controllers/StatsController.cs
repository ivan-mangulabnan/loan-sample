using Constants;
using Dtos.Requests;
using Dtos.Responses;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

// [Authorize] with no roles at the class level: authentication is still required for
// every action here, so an unauthenticated caller gets 401 and a new action cannot be
// added without a gate. The role gates sit on the actions because the two here are
// disjoint — staff read the tenant, a borrower reads only themselves. Stacked
// attributes are ANDed, not overridden, so a roles list up here would deny the Loaner
// action outright no matter what its own attribute said.
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
  private readonly StatsService _statsService;

  public StatsController (StatsService statsService)
  {
    _statsService = statsService;
  }

  /// <summary>
  /// The staff overview: headline, daily series, pipeline and average-size trend.
  /// One endpoint rather than three — the payload is shaped from the caller's role, so
  /// the client never has to pick a URL by role.
  /// </summary>
  /// <remarks>
  /// Loaner is excluded here, fail-closed: this is a tenant-wide view, and a borrower's
  /// overview comes from the /me action below instead.
  /// </remarks>
  [HttpGet("dashboard")]
  [Authorize(Roles = $"{RoleNames.Reviewer},{RoleNames.Approver},{RoleNames.Admin}")]
  public async Task<ActionResult<DashboardStatsResponse>> GetDashboard (
    [FromQuery] StatsQueryRequest statsQueryRequest)
  {
    var stats = await _statsService.GetDashboardAsync(
      User.GetTenantId(), User.GetDashboardAudience(), statsQueryRequest.Days);

    return Ok(stats);
  }

  /// <summary>
  /// The borrower's own overview: payments made in the window, their average payment,
  /// and enough loan standing to drive the callout.
  /// </summary>
  /// <remarks>
  /// A separate route and a separate response type rather than a fourth branch of
  /// GetDashboard: sharing one action would mean nulling the tenant-wide fields for
  /// borrowers on every future edit, and BorrowerStatsResponse simply has none.
  ///
  /// Scoped by GetUserId(), never a route or query parameter — a borrower id in the URL
  /// would be an IDOR waiting to happen.
  /// </remarks>
  [HttpGet("me")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<BorrowerStatsResponse>> GetMyDashboard (
    [FromQuery] StatsQueryRequest statsQueryRequest)
  {
    var stats = await _statsService.GetBorrowerDashboardAsync(
      User.GetUserId(), statsQueryRequest.Days);

    return Ok(stats);
  }
}
