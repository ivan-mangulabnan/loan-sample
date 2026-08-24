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

  [HttpGet("transactions")]
  public async Task<ActionResult<List<TransactionResponse>>> GetTransactions (
    [FromQuery] LedgerQueryRequest ledgerQueryRequest)
  {
    var tenantId = User.GetTenantId();

    try
    {
      await _ledgerService.GetOperatingLedgerAsync(tenantId);
    }
    catch (InvalidOperationException ex)
    {
      return Conflict(ex.Message);
    }

    var transactions = await _ledgerService.GetTransactionsAsync(
      tenantId, ledgerQueryRequest.Search, ledgerQueryRequest.Type);

    return Ok(TransactionResponse.From(transactions));
  }
}
