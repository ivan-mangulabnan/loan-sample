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
public class LoanApprovalController : ControllerBase
{
  private readonly LoanApprovalService _loanApprovalService;

  public LoanApprovalController (LoanApprovalService loanApprovalService)
  {
    _loanApprovalService = loanApprovalService;
  }

  [HttpPost]
  [Authorize(Roles = RoleNames.Approver)]
  public async Task<ActionResult<MessageResponse>> Create (LoanApprovalRequest loanApprovalRequest)
  {
    try
    {
      var loanApproval = await _loanApprovalService.CreateApprovalAsync(User.GetUserId(), User.GetTenantId(), loanApprovalRequest);
      if (loanApproval is null) return NotFound();

      return CreatedAtAction(nameof(GetTimeline), new { loanApplicationId = loanApproval.LoanApplicationId },
        MessageResponse.Of("Approval decision recorded."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("application/{loanApplicationId}")]
  public async Task<ActionResult<List<LoanApprovalResponse>>> GetTimeline (int loanApplicationId)
  {
    var loanApprovals = await _loanApprovalService.GetApprovalsForApplicationAsync(loanApplicationId, User.GetTenantId());

    return Ok(LoanApprovalResponse.From(loanApprovals));
  }

  [HttpGet("queue")]
  [Authorize(Roles = RoleNames.Approver)]
  public async Task<ActionResult<List<LoanApplicationResponse>>> GetQueue ()
  {
    var queue = await _loanApprovalService.GetQueueAsync(User.GetTenantId());

    return Ok(LoanApplicationResponse.From(queue));
  }
}
