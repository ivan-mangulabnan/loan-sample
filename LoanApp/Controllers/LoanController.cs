using Constants;
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

  public LoanController (LoanService loanService)
  {
    _loanService = loanService;
  }

  [HttpGet("me")]
  [Authorize(Roles = RoleNames.Loaner)]
  public async Task<ActionResult<List<LoanResponse>>> GetMine ()
  {
    var loans = await _loanService.GetLoansByBorrowerAsync(User.GetUserId());

    return Ok(LoanResponse.From(loans, DateTime.UtcNow, User.CanSeeLoanGrading()));
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<LoanResponse>> GetById (int id)
  {
    var loan = await _loanService.GetLoanAsync(id, User.GetTenantId());
    if (loan is null) return NotFound();

    return Ok(LoanResponse.From(loan, DateTime.UtcNow, User.CanSeeLoanGrading()));
  }
}
