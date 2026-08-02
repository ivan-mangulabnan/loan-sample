using Constants;
using Dtos.Requests;
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
  public async Task<IActionResult> Release (FundReleaseRequest fundReleaseRequest)
  {
    try
    {
      var fundRelease = await _fundReleaseService.ReleaseFundsAsync(User.GetUserId(), User.GetTenantId(), fundReleaseRequest);
      if (fundRelease is null) return NotFound();

      return Ok(new
      {
        fundRelease.FundReleaseId,
        fundRelease.LoanApprovalId,
        fundRelease.Amount,
        fundRelease.ReleaseDate,
        fundRelease.Remarks
      });
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
