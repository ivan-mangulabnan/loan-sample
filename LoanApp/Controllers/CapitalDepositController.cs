using Constants;
using Dtos.Requests;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleNames.Admin)]
public class CapitalDepositController : ControllerBase
{
  private readonly CapitalDepositService _capitalDepositService;

  public CapitalDepositController (CapitalDepositService capitalDepositService)
  {
    _capitalDepositService = capitalDepositService;
  }

  [HttpPost]
  public async Task<IActionResult> Deposit (CapitalDepositRequest capitalDepositRequest)
  {
    try
    {
      var capitalDeposit = await _capitalDepositService.DepositAsync(User.GetUserId(), User.GetTenantId(), capitalDepositRequest);
      if (capitalDeposit is null) return NotFound();

      return Ok(new
      {
        capitalDeposit.CapitalDepositId,
        capitalDeposit.LedgerId,
        capitalDeposit.Amount,
        capitalDeposit.DatePosted
      });
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
