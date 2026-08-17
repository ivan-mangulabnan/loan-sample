using Constants;
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

    public async Task<Status> GetRequiredApplicationStatusAsync (string code)
    {
        return await FindAsync(code, StatusCategoryCodes.LoanApplicationStatus)
            ?? throw new InvalidOperationException(
                $"Status '{code}' is not seeded in category '{StatusCategoryCodes.LoanApplicationStatus}'.");
    }

    public async Task<Status> GetRequiredLoanStatusAsync (string code)
    {
        return await FindAsync(code, StatusCategoryCodes.LoanStatus)
            ?? throw new InvalidOperationException(
                $"Status '{code}' is not seeded in category '{StatusCategoryCodes.LoanStatus}'.");
    }

    private async Task<Status?> FindAsync (string code, string statusCategoryCode)
    {
        var status = await _context.Statuses
            .SingleOrDefaultAsync(s => s.Code == code && s.StatusCategory.Code == statusCategoryCode);

        return status;
    }
}
