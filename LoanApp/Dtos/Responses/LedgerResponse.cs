using Models;

namespace Dtos.Responses;

public class LedgerResponse
{
    public string Name { get; set; } = null!;
    public decimal CurrentBalance { get; set; }

    public static LedgerResponse From (Ledger ledger) => new()
    {
        Name = ledger.Name,
        CurrentBalance = ledger.CurrentBalance
    };
}
