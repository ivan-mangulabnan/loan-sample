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

    // The parts behind Name, so the client can greet someone by first name without
    // splitting the flattened string — that split would hand back "loaner-t1-a1b2c3d4"
    // whenever Account is null, because Name falls back to the login handle. Null here
    // is exactly the Account-is-null case, which is the state the greeting must fall
    // back on, so it is explicit rather than inferred.
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }

    // Needs Role AND Account loaded. PersonName.Of falls back to the login handle when
    // Account is null, which would render "loaner-t1-a1b2c3d4" where a person's name goes.
    public static MeResponse From (User user) => new()
    {
        UserId = user.UserId,
        TenantId = user.TenantId,
        Role = user.Role.Name,
        Name = PersonName.Of(user),

        // Same already-loaded Account the line above reads — no extra query.
        FirstName = user.Account?.FirstName,
        MiddleName = user.Account?.MiddleName,
        LastName = user.Account?.LastName
    };
}
