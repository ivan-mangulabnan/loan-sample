using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class RegisterRequest
{
  [Required]
  public int TenantId { get; set; }

  [Required]
  public string UserName { get; set; } = null!;

  [Required]
  public string Password { get; set; } = null!;

  [Required]
  public string FirstName { get; set; } = null!;

  public string? MiddleName { get; set; }

  [Required]
  public string LastName { get; set; } = null!;
  
  public DateTime BirthDate { get; set; }
}