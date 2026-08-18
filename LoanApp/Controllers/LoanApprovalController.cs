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

      return Created((string?)null, MessageResponse.Of("Approval decision recorded."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet("queue")]
  [Authorize(Roles = RoleNames.Approver)]
  public async Task<ActionResult<PagedResponse<LoanApplicationResponse>>> GetQueue (
    [FromQuery] ApplicationQueryRequest applicationQueryRequest)
  {
    var (queue, totalCount) = await _loanApprovalService.GetQueueAsync(
      User.GetTenantId(), applicationQueryRequest);

    return Ok(PagedResponse<LoanApplicationResponse>.Of(
      LoanApplicationResponse.From(queue, User.CanSeeStaffNames()),
      applicationQueryRequest.Page, applicationQueryRequest.PageSize, totalCount));
  }
}
