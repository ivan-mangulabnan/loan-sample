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

  /// <summary>
  /// Tenant-wide list for staff. Loaner is excluded from the role list on purpose:
  /// a borrower reads their own records through "me", and must not see the tenant.
  ///
  /// The filters are optional: a caller that sends no query string gets the whole list,
  /// capped at ListLimit.MaxRows. There is no page parameter — the client pages what it
  /// is given, against the height of the screen it is drawing on.
  /// </summary>
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

  /// <summary>
  /// Sends a returned application back to the reviewer, with whatever the borrower
  /// changed. Named for what it does rather than for the field it edits: the plan is no
  /// longer the only thing that can move.
  ///
  /// The plan is checked here, before the service, so a bad id is a 400 that names the
  /// problem rather than a foreign-key error out of SaveChanges.
  /// </summary>
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
