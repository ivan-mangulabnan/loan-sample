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
[Authorize(Roles = RoleNames.Admin)]
public class CapitalDepositController : ControllerBase
{
  private readonly CapitalDepositService _capitalDepositService;

  public CapitalDepositController (CapitalDepositService capitalDepositService)
  {
    _capitalDepositService = capitalDepositService;
  }

  [HttpPost]
  public async Task<ActionResult<MessageResponse>> Deposit (CapitalDepositRequest capitalDepositRequest)
  {
    try
    {
      var capitalDeposit = await _capitalDepositService.DepositAsync(User.GetUserId(), User.GetTenantId(), capitalDepositRequest);
      if (capitalDeposit is null) return NotFound();

      return Ok(MessageResponse.Of($"Capital deposit of {capitalDeposit.Amount:N2} posted."));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
