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

  /// <summary>
  /// The plans a borrower can apply under. Exists so an application form can offer them
  /// by name and send back a PaymentPlanId — Create rejects an id that matches no plan.
  ///
  /// No role gate beyond a session, and no tenant filter: PaymentPlans carries no
  /// TenantId. It is global reference data, which makes it the one list in this API that
  /// is the same for every reader.
  /// </summary>
  [HttpGet]
  public async Task<ActionResult<List<PaymentPlanResponse>>> GetAll ()
  {
    var paymentPlans = await _paymentPlanService.GetPaymentPlansAsync();

    return Ok(PaymentPlanResponse.From(paymentPlans));
  }
}
