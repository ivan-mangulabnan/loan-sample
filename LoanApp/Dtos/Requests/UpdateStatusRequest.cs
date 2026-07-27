using System.ComponentModel.DataAnnotations;

namespace Dtos.Requests;

public class UpdateStatusRequest
{
    [Required]
    public int StatusId { get; set; }
}
