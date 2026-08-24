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
public class LoanApplicationController : ControllerBase
{
  private readonly LoanApplicationService _loanApplicationService;
  private readonly PaymentPlanService _paymentPlanService;

  public LoanApplicationController (LoanApplicationService loanApplicationService, PaymentPlanService paymentPlanService)
  {
    _loanApplicationService = loanApplicationService;
    _paymentPlanService = paymentPlanService;
  }

  [HttpPost]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<MessageResponse>> Create (LoanApplicationRequest loanApplicationRequest)
  {
    var paymentPlan = await _paymentPlanService.GetPaymentPlanByIdAsync(loanApplicationRequest.PaymentPlanId);
    if (paymentPlan is null) return BadRequest("Payment plan does not exist.");

    try
    {
      var loanApplication = await _loanApplicationService.CreateLoanApplicationAsync(User.GetUserId(), loanApplicationRequest);

      return Created((string?)null, MessageResponse.Of("Loan application submitted for review."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpGet]
  [Authorize(Roles = $"{RoleNames.Reviewer},{RoleNames.Approver},{RoleNames.Admin}")]
  public async Task<ActionResult<List<LoanApplicationResponse>>> GetAll (
    [FromQuery] ApplicationQueryRequest applicationQueryRequest)
  {
    var loanApplications = await _loanApplicationService.GetLoanApplicationsByTenantAsync(
      User.GetTenantId(), applicationQueryRequest);

    return Ok(LoanApplicationResponse.From(loanApplications, User.CanSeeStaffNames()));
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<LoanApplicationResponse>> GetById (int id)
  {
    var loanApplication = await _loanApplicationService.GetLoanApplicationAsync(
      id, User.GetTenantId(), User.GetUserId(), User.CanSeeStaffNames());
    if (loanApplication is null) return NotFound();

    return Ok(LoanApplicationResponse.From(loanApplication, User.CanSeeStaffNames()));
  }

  [HttpGet("me")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<List<LoanApplicationResponse>>> GetMine (
    [FromQuery] ApplicationQueryRequest applicationQueryRequest)
  {
    var loanApplications = await _loanApplicationService.GetLoanApplicationsByUserAsync(
      User.GetUserId(), applicationQueryRequest);

    return Ok(LoanApplicationResponse.From(loanApplications, User.CanSeeStaffNames()));
  }

  [HttpPut("{id}/resubmit")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<MessageResponse>> Resubmit (int id, ResubmitApplicationRequest resubmitApplicationRequest)
  {
    var paymentPlan = await _paymentPlanService.GetPaymentPlanByIdAsync(resubmitApplicationRequest.PaymentPlanId);
    if (paymentPlan is null) return BadRequest("Payment plan does not exist.");

    try
    {
      var loanApplication = await _loanApplicationService.ResubmitAsync(
        id, User.GetUserId(), resubmitApplicationRequest.PaymentPlanId, resubmitApplicationRequest.Amount);
      if (loanApplication is null) return NotFound();

      return Ok(MessageResponse.Of("Application resubmitted for review."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }

  [HttpPost("{id}/cancel")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<MessageResponse>> Cancel (int id)
  {
    try
    {
      var loanApplication = await _loanApplicationService.CancelAsync(id, User.GetUserId());
      if (loanApplication is null) return NotFound();

      return Ok(MessageResponse.Of("Loan application cancelled."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
