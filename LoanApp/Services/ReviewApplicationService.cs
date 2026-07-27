using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class ReviewApplicationService
{
    private readonly LoanAppDbContext _context;

    public ReviewApplicationService (LoanAppDbContext context)
    {
        _context = context;
    }

    public async Task<ReviewApplication?> CreateReviewAsync (int reviewerId, int tenantId, ReviewApplicationRequest reviewApplicationRequest)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Borrower)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == reviewApplicationRequest.LoanApplicationId && l.Borrower.TenantId == tenantId);

        if (loanApplication is null) return null;

        var reviewApplication = new ReviewApplication
        {
            ReviewerId = reviewerId,
            LoanApplicationId = reviewApplicationRequest.LoanApplicationId,
            StatusId = reviewApplicationRequest.StatusId,
            Remarks = reviewApplicationRequest.Remarks,
            DatePosted = DateTime.UtcNow
        };

        loanApplication.StatusId = reviewApplicationRequest.StatusId;

        _context.ReviewApplications.Add(reviewApplication);
        await _context.SaveChangesAsync();

        return reviewApplication;
    }

    public async Task<List<ReviewApplication>> GetReviewsForApplicationAsync (int loanApplicationId, int tenantId)
    {
        var reviewApplications = await _context.ReviewApplications
            .Include(r => r.Reviewer)
            .Include(r => r.Status)
            .Where(r => r.LoanApplicationId == loanApplicationId && r.LoanApplication.Borrower.TenantId == tenantId)
            .OrderBy(r => r.DatePosted)
            .ToListAsync();

        return reviewApplications;
    }
}
