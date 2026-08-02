using Constants;
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
  public async Task<IActionResult> GetBalance ()
  {
    try
    {
      var ledger = await _ledgerService.GetOperatingLedgerAsync(User.GetTenantId());

      return Ok(new { ledger.LedgerId, ledger.Name, ledger.CurrentBalance });
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }
  }
}
