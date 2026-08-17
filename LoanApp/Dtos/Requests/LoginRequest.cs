using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class LoginRequest
{
  [Required]
  public int TenantId { get; set; }

  [Required]
  public string UserName { get; set; } = null!;

  [Required]
  public string Password { get; set; } = null!;
}