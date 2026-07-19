using Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace LoanApp.Controllers;

[ApiController]
[Route("api/loans")]
public class LoansController : ControllerBase
{
    private readonly AppDbContext _context;

    public LoansController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Loans>>> GetAll()
    {
        return await _context.Loans.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Loans>> Get(int id)
    {
        var loan = await _context.Loans.FindAsync(id);

        if (loan == null)
            return NotFound();

        return loan;
    }

    [HttpPost]
    public async Task<ActionResult<Loans>> Create(Loans loan)
    {
        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = loan.LoanId }, loan);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Loans loan)
    {
        if (id != loan.LoanId)
            return BadRequest();

        _context.Entry(loan).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var loan = await _context.Loans.FindAsync(id);

        if (loan == null)
            return NotFound();

        _context.Loans.Remove(loan);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}