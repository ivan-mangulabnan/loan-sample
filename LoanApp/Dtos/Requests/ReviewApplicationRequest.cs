using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class ReviewApplicationRequest
{
    [Required]
    public int LoanApplicationId { get; set; }

    [Required]
    public int StatusId { get; set; }

    [Required]
    public string Remarks { get; set; } = null!;
}
