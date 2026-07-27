using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class StatusCategoryService
{
    private readonly LoanAppDbContext _context;

    public StatusCategoryService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<StatusCategory>> GetStatusCategoriesAsync ()
    {
        var statusCategories = await _context.StatusCategories.ToListAsync();
        return statusCategories;
    }

    public async Task<StatusCategory?> GetStatusCategoryByCodeAsync (string code)
    {
        var statusCategory = await _context.StatusCategories.FirstOrDefaultAsync(sc => sc.Code == code);
        return statusCategory;
    }
}
