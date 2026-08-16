using Data;
using Dtos.Requests;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class AuthService
{
  private readonly LoanAppDbContext _context;
  private readonly RoleService _roleService;

  public AuthService (LoanAppDbContext context, RoleService roleService)
  {
    _context = context;
    _roleService = roleService;
  }

  public async Task<User?> ValidateCredentialsAsync(LoginRequest loginRequest)
  {
    var user = await GetUserAsync(loginRequest.TenantId, loginRequest.UserName);

    if (user is null) return null;

    var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, loginRequest.Password);

    if (result == PasswordVerificationResult.Failed) return null;
    
    return user;
  }

  public async Task<User?> GetUserAsync (int tenantId, string userName)
  {
    var user = await _context.Users.Include(u => u.Role)
      .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.UserName == userName);
    
    return user;
  }

  // Separate from GetUserAsync on purpose: that one serves login and the registration
  // duplicate check, neither of which renders a name, and widening it would hide this
  // include-contract from the only code that depends on it. Keyed on UserId, which
  // arrives from a signature-validated claim.
  public async Task<User?> GetUserForIdentityAsync (int userId)
  {
    return await _context.Users
      .Include(u => u.Role)
      .Include(u => u.Account)
      .FirstOrDefaultAsync(u => u.UserId == userId);
  }

  public async Task<User?> RegisterUserAsync (RegisterRequest registerRequest)
  {
    var tenantExists = await _context.Tenants.AnyAsync(t => t.TenantId == registerRequest.TenantId);

    if (!tenantExists)
      throw new InvalidOperationException($"Tenant {registerRequest.TenantId} does not exist.");

    var user = await GetUserAsync(registerRequest.TenantId, registerRequest.UserName);
    if (user is not null) return null;

    var loanerRole = await _roleService.GetLoanerRoleAsync();

    if (loanerRole is null) throw new InvalidOperationException("Role 'Loaner' is not seeded.");

    var newUser = new User
    {
      TenantId = registerRequest.TenantId,
      RoleId = loanerRole.RoleId,
      UserName = registerRequest.UserName,
      PasswordHash = ""
    };

    newUser.PasswordHash = new PasswordHasher<User>().HashPassword(newUser, registerRequest.Password);

    _context.Users.Add(newUser);

    var newAccount = new Account
    {
      User = newUser,
      FirstName = registerRequest.FirstName,
      MiddleName = registerRequest.MiddleName,
      LastName = registerRequest.LastName,
      Birthdate = registerRequest.Birthdate
    };

    _context.Accounts.Add(newAccount);
    await _context.SaveChangesAsync();

    return newUser;
  } 
}