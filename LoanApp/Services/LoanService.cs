using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class LoanService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;

    public LoanService (LoanAppDbContext context, StatusService statusService)
    {
        _context = context;
        _statusService = statusService;
    }

    public async Task<Loan> CreateFromReleaseAsync (LoanApproval loanApproval, FundRelease fundRelease)
    {
        var active = await _statusService.GetRequiredLoanStatusAsync(LoanLifecycleCodes.Active);
        var startDate = fundRelease.ReleaseDate;

        var loan = new Loan
        {
            FundReleaseId = fundRelease.FundReleaseId,
            BorrowerId = loanApproval.LoanApplication.BorrowerId,
            StatusId = active.StatusId,
            InterestRate = loanApproval.InterestRate,
            NumberOfMonths = loanApproval.NumberOfMonths,
            PrincipalAmount = loanApproval.PrincipalAmount,
            TotalRepaymentAmount = loanApproval.TotalRepaymentAmount,
            Balance = loanApproval.TotalRepaymentAmount,
            StartDate = startDate,
            DueDate = startDate.AddMonths(loanApproval.NumberOfMonths)
        };

        _context.Loans.Add(loan);

        return loan;
    }

    /// <summary>
    /// A borrower's own loans, newest first. Every Include here is a reference, so there
    /// is no collection to fan out and no split query to reach for.
    /// </summary>
    public async Task<(List<Loan> Items, int TotalCount)> GetLoansByBorrowerAsync (
        int borrowerId, LoanQueryRequest loanQueryRequest)
    {
        var query = _context.Loans.Where(l => l.BorrowerId == borrowerId);

        // The loan lifecycle is its own status category — ACTIVE/PAID/OVERDUE/DEFAULTED,
        // never PENDING_REVIEW. Filtering by code rather than label because "Fully Paid"
        // is the label behind PAID and the two must not be conflated.
        if (!string.IsNullOrWhiteSpace(loanQueryRequest.Status))
        {
            var statusCode = loanQueryRequest.Status;
            query = query.Where(l => l.Status.Code == statusCode);
        }

        // Loans carry no borrower name worth searching — the reader is the borrower — so
        // the term is a reference number or nothing. "#12" is what the table prints.
        if (!string.IsNullOrWhiteSpace(loanQueryRequest.Search))
        {
            var term = loanQueryRequest.Search.Trim().TrimStart('#');

            // An unparseable term matches nothing rather than being ignored: silently
            // returning every loan for a typed word reads as a broken filter.
            query = int.TryParse(term, out var reference)
                ? query.Where(l => l.LoanId == reference)
                : query.Where(l => false);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Include(l => l.Status)
            // LoanId breaks ties: StartDate is the release stamp, so loans released in
            // one batch share it and Skip/Take would be free to repeat a row.
            .OrderByDescending(l => l.StartDate)
            .ThenByDescending(l => l.LoanId)
            .Skip(loanQueryRequest.Skip)
            .Take(loanQueryRequest.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Loan?> GetLoanAsync (int loanId, int tenantId, int requesterId, bool isStaff)
    {
        return await _context.Loans
            .Include(l => l.Borrower).ThenInclude(b => b.Account)
            .Include(l => l.Status)
            .FirstOrDefaultAsync(l => l.LoanId == loanId
                                   && l.Borrower.TenantId == tenantId
                                   && (isStaff || l.BorrowerId == requesterId));
    }
}
