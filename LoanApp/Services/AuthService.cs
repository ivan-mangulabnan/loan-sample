using Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class AuthService
{
  private readonly LoanAppDbContext _context;

  public AuthService (LoanAppDbContext context)
  {
    _context = context;
  }

  public async Task<User?> ValidateCredentialsAsync(int tenantId, string userName, string password)
  {
    var user = await _context.Users.Include(u => u.Role)
      .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.UserName == userName);

    if (user is null) return null;

    var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, password);

    if (result == PasswordVerificationResult.Failed) return null;
    
    return user;
  }
}