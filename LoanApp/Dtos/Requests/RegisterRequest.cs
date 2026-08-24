using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class RegisterRequest
{
  private const string NamePattern = @"^(?=.*\p{L})[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$";
  private const string NameError = "Name may only contain letters, spaces, apostrophes, hyphens and periods.";

  [Required]
  public int TenantId { get; set; }

  [Required]
  public string UserName { get; set; } = null!;

  [Required]
  public string Password { get; set; } = null!;

  [Required]
  [RegularExpression(NamePattern, ErrorMessage = NameError)]
  public string FirstName { get; set; } = null!;

  [RegularExpression(NamePattern, ErrorMessage = NameError)]
  public string? MiddleName { get; set; }

  [Required]
  [RegularExpression(NamePattern, ErrorMessage = NameError)]
  public string LastName { get; set; } = null!;

  public DateTime Birthdate { get; set; }
}