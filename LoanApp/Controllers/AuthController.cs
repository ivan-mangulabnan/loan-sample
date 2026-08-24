using Dtos.Requests;
using Dtos.Responses;
using Extensions;
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
  private readonly IConfiguration _config;
  private readonly IWebHostEnvironment _environment;

  public AuthController (AuthService authService, TokenService tokenService,
    IConfiguration config, IWebHostEnvironment environment)
  {
    _authService = authService;
    _tokenService = tokenService;
    _config = config;
    _environment = environment;
  }

  private bool CookieIsSecure => !_environment.IsDevelopment();

  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<ActionResult<MeResponse>> Login (LoginRequest loginRequest)
  {
    var user = await _authService.ValidateCredentialsAsync(loginRequest);
    if (user is null) return Unauthorized();

    var token = _tokenService.CreateToken(user);
    var expires = DateTimeOffset.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!));

    Response.Cookies.Append(AuthCookie.Name, token, AuthCookie.Options(CookieIsSecure, expires));

    var identity = await _authService.GetUserForIdentityAsync(user.UserId);

    return Ok(MeResponse.From(identity!));
  }

  [Authorize]
  [HttpGet("me")]
  public async Task<ActionResult<MeResponse>> Me ()
  {
    var user = await _authService.GetUserForIdentityAsync(User.GetUserId());
    if (user is null) return Unauthorized();

    return Ok(MeResponse.From(user));
  }

  [AllowAnonymous]
  [HttpPost("logout")]
  public IActionResult Logout ()
  {
    Response.Cookies.Delete(AuthCookie.Name, AuthCookie.Deletion(CookieIsSecure));

    return NoContent();
  }

  [AllowAnonymous]
  [HttpPost("register")]
  public async Task<ActionResult<MessageResponse>> Register (RegisterRequest registerRequest)
  {
    try
    {
      var newUser = await _authService.RegisterUserAsync(registerRequest);
      if (newUser is null) return Conflict();

      return Ok(MessageResponse.Of("Account created successfully."));
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(ex.Message);
    }
    catch (Exception)
    {
      return Problem(detail: "Something went wrong. Please try again later");
    }
  }
}