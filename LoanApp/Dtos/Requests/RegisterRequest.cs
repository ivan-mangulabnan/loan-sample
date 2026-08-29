using System.ComponentModel.DataAnnotations;
using Validation;

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

  [Required]
  [Birthdate(ErrorMessage = "You have to be at least 18 to open an account.")]
  public DateTime Birthdate { get; set; }
}