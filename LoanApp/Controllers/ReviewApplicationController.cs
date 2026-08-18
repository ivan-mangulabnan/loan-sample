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
public class ReviewApplicationController : ControllerBase
{
  private readonly ReviewApplicationService _reviewApplicationService;

  public ReviewApplicationController (ReviewApplicationService reviewApplicationService)
  {
    _reviewApplicationService = reviewApplicationService;
  }

  [HttpPost]
  [Authorize(Roles = RoleNames.Reviewer)]
  public async Task<ActionResult<MessageResponse>> Create (ReviewApplicationRequest reviewApplicationRequest)
  {
    try
    {
      var reviewApplication = await _reviewApplicationService.CreateReviewAsync(User.GetUserId(), User.GetTenantId(), reviewApplicationRequest);
      if (reviewApplication is null) return NotFound();

      return Created((string?)null, MessageResponse.Of("Review recorded."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("queue")]
  [Authorize(Roles = RoleNames.Reviewer)]
  public async Task<ActionResult<List<LoanApplicationResponse>>> GetQueue (
    [FromQuery] ApplicationQueryRequest applicationQueryRequest)
  {
    var queue = await _reviewApplicationService.GetQueueAsync(
      User.GetTenantId(), applicationQueryRequest);

    return Ok(LoanApplicationResponse.From(queue, User.CanSeeStaffNames()));
  }
}
