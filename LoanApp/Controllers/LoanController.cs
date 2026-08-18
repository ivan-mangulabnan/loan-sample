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
public class LoanController : ControllerBase
{
  private readonly LoanService _loanService;
  private readonly PaymentService _paymentService;

  public LoanController (LoanService loanService, PaymentService paymentService)
  {
    _loanService = loanService;
    _paymentService = paymentService;
  }

  [HttpGet("me")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<List<LoanResponse>>> GetMine (
    [FromQuery] LoanQueryRequest loanQueryRequest)
  {
    var loans = await _loanService.GetLoansByBorrowerAsync(User.GetUserId(), loanQueryRequest);

    return Ok(LoanResponse.From(loans, DateTime.UtcNow, User.CanSeeLoanGrading()));
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<LoanResponse>> GetById (int id)
  {
    var loan = await _loanService.GetLoanAsync(id, User.GetTenantId(), User.GetUserId(), User.CanSeeStaffNames());
    if (loan is null) return NotFound();

    return Ok(LoanResponse.From(loan, DateTime.UtcNow, User.CanSeeLoanGrading()));
  }

  // A sub-resource of the loan: same visibility question as GetById, so it lives here
  // rather than on PaymentController and inherits this controller's bare [Authorize].
  [HttpGet("{id}/payments")]
  public async Task<ActionResult<List<PaymentResponse>>> GetPayments (int id)
  {
    var payments = await _paymentService.GetForLoanAsync(
      id, User.GetTenantId(), User.GetUserId(), User.CanSeeStaffNames());
    if (payments is null) return NotFound();

    // showBorrower: false — a borrower reading their own loan does not need their own
    // name echoed back, and staff already have it from the loan read.
    return Ok(PaymentResponse.From(payments, showBorrower: false));
  }
}
