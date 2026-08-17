using Microsoft.AspNetCore.Http;

namespace Security;

// The SPA holds the JWT here rather than in localStorage, so injected script cannot
// read it. The cookie carries the access token itself — there is no refresh token, so
// the JWT's expiry is the whole session lifetime and nothing revokes it early.
public static class AuthCookie
{
  public const string Name = "loanapp_auth";

  // SameSite=Strict is the only CSRF defence in this API — cookies are sent
  // automatically where a bearer header could not be forged, and there is no
  // antiforgery token anywhere. Loosening this to Lax or None needs one first.
  public static CookieOptions Options (bool secure, DateTimeOffset expires) => new()
  {
    HttpOnly = true,
    Secure = secure,
    SameSite = SameSiteMode.Strict,
    Path = "/",
    Expires = expires
  };

  // Must match the flags the cookie was stored with, minus Expires, or the browser
  // keeps it and signing out silently leaves a working credential behind.
  public static CookieOptions Deletion (bool secure) => new()
  {
    HttpOnly = true,
    Secure = secure,
    SameSite = SameSiteMode.Strict,
    Path = "/"
  };
}
