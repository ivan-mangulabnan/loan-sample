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
[Authorize(Roles = RoleNames.Admin)]
public class FundReleaseController : ControllerBase
{
  private readonly FundReleaseService _fundReleaseService;

  public FundReleaseController (FundReleaseService fundReleaseService)
  {
    _fundReleaseService = fundReleaseService;
  }

  [HttpPost]
  public async Task<ActionResult<MessageResponse>> Release (FundReleaseRequest fundReleaseRequest)
  {
    try
    {
      var fundRelease = await _fundReleaseService.ReleaseFundsAsync(User.GetUserId(), User.GetTenantId(), fundReleaseRequest);
      if (fundRelease is null) return NotFound();

      return Ok(MessageResponse.Of("Funds released."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("queue")]
  public async Task<ActionResult<List<FundReleaseQueueResponse>>> GetQueue (
    [FromQuery] ApplicationQueryRequest applicationQueryRequest)
  {
    var queue = await _fundReleaseService.GetQueueAsync(
      User.GetTenantId(), applicationQueryRequest);

    return Ok(FundReleaseQueueResponse.From(queue));
  }
}
