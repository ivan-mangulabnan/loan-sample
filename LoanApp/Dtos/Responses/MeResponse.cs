using Models;

namespace Dtos.Responses;

public class MeResponse
{
    public int UserId { get; set; }
    public int TenantId { get; set; }

    public string Role { get; set; } = null!;
    public string Name { get; set; } = null!;

    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }

    public static MeResponse From (User user) => new()
    {
        UserId = user.UserId,
        TenantId = user.TenantId,
        Role = user.Role.Name,
        Name = PersonName.Of(user),

        FirstName = user.Account?.FirstName,
        MiddleName = user.Account?.MiddleName,
        LastName = user.Account?.LastName
    };
}
