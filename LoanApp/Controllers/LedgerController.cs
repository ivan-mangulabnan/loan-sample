using Constants;
using Dtos.Responses;
using Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleNames.Admin)]
public class LedgerController : ControllerBase
{
  private readonly LedgerService _ledgerService;

  public LedgerController (LedgerService ledgerService)
  {
    _ledgerService = ledgerService;
  }

  [HttpGet("balance")]
  public async Task<ActionResult<LedgerResponse>> GetBalance ()
  {
    try
    {
      var ledger = await _ledgerService.GetOperatingLedgerAsync(User.GetTenantId());

      return Ok(LedgerResponse.From(ledger));
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
