using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class StatusService
{
    private readonly LoanAppDbContext _context;

    public StatusService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Status>> GetStatusesAsync ()
    {
        var statuses = await _context.Statuses.ToListAsync();
        return statuses;
    }

    public async Task<Status?> GetStatusByCodeAsync (string code)
    {
        var status = await _context.Statuses.FirstOrDefaultAsync(s => s.Code == code);
        return status;
    }
}
