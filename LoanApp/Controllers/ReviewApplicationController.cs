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

      return CreatedAtAction(nameof(GetTimeline), new { loanApplicationId = reviewApplication.LoanApplicationId },
        MessageResponse.Of("Review recorded."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("application/{loanApplicationId}")]
  public async Task<ActionResult<List<ReviewApplicationResponse>>> GetTimeline (int loanApplicationId)
  {
    var reviewApplications = await _reviewApplicationService.GetReviewsForApplicationAsync(loanApplicationId, User.GetTenantId());

    return Ok(ReviewApplicationResponse.From(reviewApplications));
  }

  [HttpGet("queue")]
  [Authorize(Roles = RoleNames.Reviewer)]
  public async Task<ActionResult<List<LoanApplicationResponse>>> GetQueue ()
  {
    var queue = await _reviewApplicationService.GetQueueAsync(User.GetTenantId());

    return Ok(LoanApplicationResponse.From(queue));
  }
}
