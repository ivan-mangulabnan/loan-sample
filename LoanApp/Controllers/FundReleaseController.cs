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

  /// <summary>
  /// Release the funds, or refuse to. One endpoint rather than two because the desk
  /// makes one decision, the same shape the review and approval desks take.
  ///
  /// The sentence branches on the decision. useWriteAction shows whatever comes back
  /// verbatim as the reader's notice, so a fixed "Funds released." would announce a
  /// disbursement that did not happen.
  /// </summary>
  [HttpPost]
  public async Task<ActionResult<MessageResponse>> Decide (FundReleaseRequest fundReleaseRequest)
  {
    try
    {
      var fundRelease = await _fundReleaseService.DecideAsync(User.GetUserId(), User.GetTenantId(), fundReleaseRequest);
      if (fundRelease is null) return NotFound();

      return Ok(MessageResponse.Of(fundReleaseRequest.Decision == Decision.Reject
        ? "Release rejected."
        : "Funds released."));
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
