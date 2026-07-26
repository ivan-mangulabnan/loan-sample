using Dtos.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Security;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly AuthService _authService;
  private readonly TokenService _tokenService;

  public AuthController (AuthService authService, TokenService tokenService)
  {
    _authService = authService;
    _tokenService = tokenService;
  }


  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<IActionResult> Login (LoginRequest loginRequest)
  {
    var user = await _authService.ValidateCredentialsAsync(loginRequest);
    if (user is null) return Unauthorized();

    var token = _tokenService.CreateToken(user);
    return Ok(new { token });
  }
}