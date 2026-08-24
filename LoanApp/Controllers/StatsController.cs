using Constants;
using Dtos.Requests;
using Dtos.Responses;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

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

  [HttpGet("dashboard")]
  [Authorize(Roles = $"{RoleNames.Reviewer},{RoleNames.Approver},{RoleNames.Admin}")]
  public async Task<ActionResult<DashboardStatsResponse>> GetDashboard (
    [FromQuery] StatsQueryRequest statsQueryRequest)
  {
    var stats = await _statsService.GetDashboardAsync(
      User.GetTenantId(), User.GetDashboardAudience(), statsQueryRequest.Days);

    return Ok(stats);
  }

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
