using Constants;
using Dtos.Requests;
using Dtos.Responses;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

// Its own controller rather than a second action on PaymentController: that one is
// [Authorize(Roles = Loaner)] at the class level, and pushing the attribute down onto
// Post to make room here would turn a fail-closed default into a fail-open one.
[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = RoleNames.Admin)]
public class AdminPaymentController : ControllerBase
{
  private readonly PaymentService _paymentService;

  public AdminPaymentController (PaymentService paymentService)
  {
    _paymentService = paymentService;
  }

  [HttpGet]
  public async Task<ActionResult<PagedResponse<PaymentResponse>>> GetPayments (
    [FromQuery] PaymentQueryRequest paymentQueryRequest)
  {
    var (payments, totalCount) = await _paymentService.GetPagedAsync(
      User.GetTenantId(), paymentQueryRequest.BorrowerId,
      paymentQueryRequest.From, paymentQueryRequest.To,
      paymentQueryRequest.Skip, paymentQueryRequest.PageSize);

    // showBorrower: true — identifying who paid is the point of this list.
    return Ok(PagedResponse<PaymentResponse>.Of(
      PaymentResponse.From(payments, showBorrower: true),
      paymentQueryRequest.Page, paymentQueryRequest.PageSize, totalCount));
  }
}
