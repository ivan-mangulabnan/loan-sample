using Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentPlanController : ControllerBase
{
  private readonly PaymentPlanService _paymentPlanService;

  public PaymentPlanController (PaymentPlanService paymentPlanService)
  {
    _paymentPlanService = paymentPlanService;
  }

  [HttpGet]
  public async Task<ActionResult<List<PaymentPlanResponse>>> GetAll ()
  {
    var paymentPlans = await _paymentPlanService.GetPaymentPlansAsync();

    return Ok(PaymentPlanResponse.From(paymentPlans));
  }
}
