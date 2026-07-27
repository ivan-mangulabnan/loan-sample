using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class InterestService
{
    private readonly LoanAppDbContext _context;

    public InterestService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Interest>> GetInterestsAsync ()
    {
        var interests = await _context.Interests.ToListAsync();
        return interests;
    }

    public async Task<Interest?> GetInterestByRateAsync (decimal interestRate)
    {
        var interest = await _context.Interests.FirstOrDefaultAsync(i => i.InterestRate == interestRate);
        return interest;
    }
}