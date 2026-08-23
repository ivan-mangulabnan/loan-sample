using Constants;
using Dtos.Requests;
using Dtos.Responses;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

// Two roles, one domain, one service. The class carries no [Authorize] because its
// actions do not share a role: a borrower posts a payment, an admin reads the tenant's
// whole list. Every action therefore states its own role, and none may rely on being
// un-attributed — Program.cs sets a FallbackPolicy of RequireAuthenticatedUser, so an
// action added here without an attribute is refused rather than served anonymously.
//
// That fallback is what makes this shape safe. Before it, dropping the class-level
// attribute would have turned a fail-closed default into a fail-open one.
[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
  private readonly PaymentService _paymentService;

  public PaymentController (PaymentService paymentService)
  {
    _paymentService = paymentService;
  }

  [HttpPost]
  [Authorize(Roles = RoleNames.Loaner)]
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

  /// <summary>
  /// The tenant-wide payment list. Kept at its own absolute route rather than moving to
  /// GET api/Payment: /admin/payments is a documented Admin surface, and Stats/dashboard
  /// nulls its payments field for non-Admin specifically so it cannot become a side door
  /// around this one. Moving the URL would quietly relocate that boundary.
  /// </summary>
  [HttpGet("~/api/admin/payments")]
  [Authorize(Roles = RoleNames.Admin)]
  public async Task<ActionResult<List<PaymentResponse>>> GetPayments (
    [FromQuery] PaymentQueryRequest paymentQueryRequest)
  {
    var payments = await _paymentService.GetFilteredAsync(
      User.GetTenantId(), paymentQueryRequest.BorrowerId,
      paymentQueryRequest.From, paymentQueryRequest.To);

    // showBorrower: true — identifying who paid is the point of this list.
    return Ok(PaymentResponse.From(payments, showBorrower: true));
  }
}
