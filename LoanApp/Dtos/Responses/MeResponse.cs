using Models;

namespace Dtos.Responses;

// What the SPA is allowed to know about itself. The JWT lives in an HttpOnly cookie the
// browser cannot read, so this endpoint is how the client learns its own identity — and
// the server stays the authority, so a role change takes effect without waiting for the
// token to expire.
public class MeResponse
{
    public int UserId { get; set; }
    public int TenantId { get; set; }

    public string Role { get; set; } = null!;
    public string Name { get; set; } = null!;

    // Needs Role AND Account loaded. PersonName.Of falls back to the login handle when
    // Account is null, which would render "loaner-t1-a1b2c3d4" where a person's name goes.
    public static MeResponse From (User user) => new()
    {
        UserId = user.UserId,
        TenantId = user.TenantId,
        Role = user.Role.Name,
        Name = PersonName.Of(user)
    };
}
