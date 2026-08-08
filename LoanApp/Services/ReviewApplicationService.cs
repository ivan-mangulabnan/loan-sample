using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class ReviewApplicationService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;

    public ReviewApplicationService (LoanAppDbContext context, StatusService statusService)
    {
        _context = context;
        _statusService = statusService;
    }

    public async Task<ReviewApplication?> CreateReviewAsync (int reviewerId, int tenantId, ReviewApplicationRequest reviewApplicationRequest)
    {
        var loanApplication = await _context.LoanApplications
            .Include(l => l.Borrower)
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanApplicationId == reviewApplicationRequest.LoanApplicationId && l.Borrower.TenantId == tenantId);

        if (loanApplication is null) return null;

        if (loanApplication.Status.Code != LoanApplicationStatusCodes.PendingReview)
            throw new InvalidOperationException($"Cannot review an application with status '{loanApplication.Status.Code}'.");

        var (reviewCode, applicationCode) = reviewApplicationRequest.Decision switch
        {
            Decision.Approve => (LoanApplicationStatusCodes.Approved, LoanApplicationStatusCodes.PendingApproval),
            Decision.Reject => (LoanApplicationStatusCodes.Rejected, LoanApplicationStatusCodes.Rejected),
            Decision.Return => (LoanApplicationStatusCodes.ReturnedByReviewer, LoanApplicationStatusCodes.ReturnedByReviewer),
            _ => throw new InvalidOperationException($"Unknown decision '{reviewApplicationRequest.Decision}'.")
        };

        var reviewStatus = await _statusService.GetRequiredApplicationStatusAsync(reviewCode);
        var applicationStatus = await _statusService.GetRequiredApplicationStatusAsync(applicationCode);

        var reviewApplication = new ReviewApplication
        {
            ReviewerId = reviewerId,
            LoanApplicationId = reviewApplicationRequest.LoanApplicationId,
            StatusId = reviewStatus.StatusId,
            Remarks = reviewApplicationRequest.Remarks,
            DatePosted = DateTime.UtcNow
        };

        loanApplication.StatusId = applicationStatus.StatusId;

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

    public async Task<List<LoanApplication>> GetQueueAsync (int tenantId)
    {
        return await _context.LoanApplications
            .Include(l => l.Borrower)
            .Include(l => l.PaymentPlan)
            .Include(l => l.Status)
            .Where(l => l.Borrower.TenantId == tenantId && l.Status.Code == LoanApplicationStatusCodes.PendingReview)
            .OrderBy(l => l.DateRequested)
            .ToListAsync();
    }
}
