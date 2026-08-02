using Constants;
using Data;
using Models;
using Microsoft.EntityFrameworkCore;

namespace Services;

public class RoleService
{
  private readonly LoanAppDbContext _context;

  public RoleService (LoanAppDbContext context)
  {
    _context = context;
  }

  public async Task<Role?> GetLoanerRoleAsync ()
  {
    return await _context.Roles.FirstOrDefaultAsync(r => r.Name == RoleNames.Loaner);
  }
}