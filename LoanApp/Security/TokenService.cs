using Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace Security;

public class TokenService
{
  private readonly IConfiguration _config;

  public TokenService(IConfiguration config)
  {
    _config = config;
  }

  public string CreateToken (User user)
  {
    var claims = new List<Claim>
    {
      new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
      new Claim(ClaimTypes.Role, user.Role.Name),
      new Claim("tenantId", user.TenantId.ToString())
    };

    var key = new SymmetricSecurityKey(
      Encoding.UTF8.GetBytes(_config["Jwt:SigningKey"]!)
    );

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
      issuer: _config["Jwt:Issuer"],
      audience: _config["Jwt:Audience"],
      claims: claims,
      expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!)),
      signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
  }
}