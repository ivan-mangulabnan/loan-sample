using System.Security.Claims;
using Dtos.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanApplicationController : ControllerBase
{
  private readonly LoanApplicationService _loanApplicationService;

  public LoanApplicationController (LoanApplicationService loanApplicationService)
  {
    _loanApplicationService = loanApplicationService;
  }

  [HttpPost]
  public async Task<IActionResult> Create (LoanApplicationRequest loanApplicationRequest)
  {
    var borrowerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var loanApplication = await _loanApplicationService.CreateLoanApplicationAsync(borrowerId, loanApplicationRequest);

    return CreatedAtAction(nameof(GetById), new { id = loanApplication.LoanApplicationId }, loanApplication);
  }

  [HttpGet("{id}")]
  public async Task<IActionResult> GetById (int id)
  {
    var loanApplication = await _loanApplicationService.GetLoanApplicationAsync(id);
    if (loanApplication is null) return NotFound();

    return Ok(loanApplication);
  }

  [HttpGet("me")]
  public async Task<IActionResult> GetMine ()
  {
    var borrowerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var loanApplications = await _loanApplicationService.GetLoanApplicationsByUserAsync(borrowerId);

    return Ok(loanApplications);
  }

  [HttpPut("{id}/status")]
  [Authorize(Roles = "Admin,Reviewer,Approver")]
  public async Task<IActionResult> UpdateStatus (int id, UpdateStatusRequest updateStatusRequest)
  {
    var loanApplication = await _loanApplicationService.UpdateStatusAsync(id, updateStatusRequest.StatusId);
    if (loanApplication is null) return NotFound();

    return Ok(loanApplication);
  }
}
