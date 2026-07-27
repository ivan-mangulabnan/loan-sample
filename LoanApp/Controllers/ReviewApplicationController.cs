using Dtos.Requests;
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
  private readonly StatusService _statusService;

  public ReviewApplicationController (ReviewApplicationService reviewApplicationService, StatusService statusService)
  {
    _reviewApplicationService = reviewApplicationService;
    _statusService = statusService;
  }

  [HttpPost]
  [Authorize(Roles = "Reviewer")]
  public async Task<IActionResult> Create (ReviewApplicationRequest reviewApplicationRequest)
  {
    var status = await _statusService.GetStatusByIdAsync(reviewApplicationRequest.StatusId);
    if (status is null) return BadRequest("Status does not exist.");

    var reviewApplication = await _reviewApplicationService.CreateReviewAsync(User.GetUserId(), User.GetTenantId(), reviewApplicationRequest);
    if (reviewApplication is null) return NotFound();

    return CreatedAtAction(nameof(GetTimeline), new { loanApplicationId = reviewApplication.LoanApplicationId }, reviewApplication);
  }

  [HttpGet("application/{loanApplicationId}")]
  public async Task<IActionResult> GetTimeline (int loanApplicationId)
  {
    var reviewApplications = await _reviewApplicationService.GetReviewsForApplicationAsync(loanApplicationId, User.GetTenantId());

    return Ok(reviewApplications);
  }
}
