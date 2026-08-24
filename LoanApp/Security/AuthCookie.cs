using Microsoft.AspNetCore.Http;

namespace Security;

public static class AuthCookie
{
  public const string Name = "loanapp_auth";

  public static CookieOptions Options (bool secure, DateTimeOffset expires) => new()
  {
    HttpOnly = true,
    Secure = secure,
    SameSite = SameSiteMode.Strict,
    Path = "/",
    Expires = expires
  };

  public static CookieOptions Deletion (bool secure) => new()
  {
    HttpOnly = true,
    Secure = secure,
    SameSite = SameSiteMode.Strict,
    Path = "/"
  };
}
