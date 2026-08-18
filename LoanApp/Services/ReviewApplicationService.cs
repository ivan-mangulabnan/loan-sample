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

        if (reviewApplicationRequest.Decision is Decision.Reject or Decision.Return
            && string.IsNullOrWhiteSpace(reviewApplicationRequest.Remarks))
            throw new InvalidOperationException(
                "Remarks are required when rejecting or returning an application.");

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

    /// <summary>
    /// The first-pass desk: applications sitting at PENDING_REVIEW, oldest first, so the
    /// longest wait is worked first.
    /// </summary>
    public async Task<(List<LoanApplication> Items, int TotalCount)> GetQueueAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApplications
            .ForTenant(tenantId)
            // The stage is this desk's identity, not a caller-supplied filter — the
            // request's own Status narrows within it and cannot widen past it.
            .WhereStatusCode(LoanApplicationStatusCodes.PendingReview)
            .WhereMatches(applicationQueryRequest.Search);

        var totalCount = await query.CountAsync();

        var items = await query
            .WithApplicationDetail()
            .OrderBy(l => l.DateRequested)
            .ThenBy(l => l.LoanApplicationId)
            .Skip(applicationQueryRequest.Skip)
            .Take(applicationQueryRequest.PageSize)
            .AsSplitQuery()
            .ToListAsync();

        return (items, totalCount);
    }
}
