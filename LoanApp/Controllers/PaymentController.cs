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
[Authorize(Roles = RoleNames.Loaner)]
public class PaymentController : ControllerBase
{
  private readonly PaymentService _paymentService;

  public PaymentController (PaymentService paymentService)
  {
    _paymentService = paymentService;
  }

  [HttpPost]
  public async Task<ActionResult<MessageResponse>> Post (PaymentRequest paymentRequest)
  {
    try
    {
      var payment = await _paymentService.PostAsync(User.GetUserId(), paymentRequest);
      if (payment is null) return NotFound();

      return Created((string?)null, MessageResponse.Of($"Payment of {payment.Amount:N2} posted."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
