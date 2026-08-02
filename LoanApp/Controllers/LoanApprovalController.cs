using Constants;
using Dtos.Requests;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanApprovalController : ControllerBase
{
  private readonly LoanApprovalService _loanApprovalService;

  public LoanApprovalController (LoanApprovalService loanApprovalService)
  {
    _loanApprovalService = loanApprovalService;
  }

  [HttpPost]
  [Authorize(Roles = RoleNames.Approver)]
  public async Task<IActionResult> Create (LoanApprovalRequest loanApprovalRequest)
  {
    try
    {
      var loanApproval = await _loanApprovalService.CreateApprovalAsync(User.GetUserId(), User.GetTenantId(), loanApprovalRequest);
      if (loanApproval is null) return NotFound();

      return CreatedAtAction(nameof(GetTimeline), new { loanApplicationId = loanApproval.LoanApplicationId }, loanApproval);
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("application/{loanApplicationId}")]
  public async Task<IActionResult> GetTimeline (int loanApplicationId)
  {
    var loanApprovals = await _loanApprovalService.GetApprovalsForApplicationAsync(loanApplicationId, User.GetTenantId());

    return Ok(loanApprovals);
  }

  [HttpGet("queue")]
  [Authorize(Roles = RoleNames.Approver)]
  public async Task<IActionResult> GetQueue ()
  {
    var queue = await _loanApprovalService.GetQueueAsync(User.GetTenantId());

    return Ok(queue);
  }
}
