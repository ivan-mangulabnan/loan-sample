using Dtos.Requests;
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
  public async Task<IActionResult> Create (LoanApplicationRequest loanApplicationRequest)
  {
    var borrowerId = User.GetUserId();

    var loanApplication = await _loanApplicationService.CreateLoanApplicationAsync(borrowerId, loanApplicationRequest);

    return CreatedAtAction(nameof(GetById), new { id = loanApplication.LoanApplicationId }, loanApplication);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById (int id)
  {
    var loanApplication = await _loanApplicationService.GetLoanApplicationAsync(id, User.GetTenantId());
    if (loanApplication is null) return NotFound();

    return Ok(loanApplication);
  }

  [HttpGet("me")]
  public async Task<IActionResult> GetMine ()
  {
    var loanApplications = await _loanApplicationService.GetLoanApplicationsByUserAsync(User.GetUserId());

    return Ok(loanApplications);
  }

  [HttpPut("{id}/payment-plan")]
  public async Task<IActionResult> UpdatePaymentPlan (int id, UpdatePaymentPlanRequest updatePaymentPlanRequest)
  {
    var paymentPlan = await _paymentPlanService.GetPaymentPlanByIdAsync(updatePaymentPlanRequest.PaymentPlanId);
    if (paymentPlan is null) return BadRequest("Payment plan does not exist.");

    try
    {
      var loanApplication = await _loanApplicationService.UpdatePaymentPlanAsync(id, User.GetUserId(), updatePaymentPlanRequest.PaymentPlanId);
      if (loanApplication is null) return NotFound();

      return Ok(loanApplication);
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
