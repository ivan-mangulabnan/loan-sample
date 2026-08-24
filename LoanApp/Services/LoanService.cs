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

    public async Task<List<Loan>> GetLoansByBorrowerAsync (
        int borrowerId, LoanQueryRequest loanQueryRequest)
    {
        var query = _context.Loans.Where(l => l.BorrowerId == borrowerId);

        if (!string.IsNullOrWhiteSpace(loanQueryRequest.Status))
        {
            var statusCode = loanQueryRequest.Status;
            query = query.Where(l => l.Status.Code == statusCode);
        }

        if (!string.IsNullOrWhiteSpace(loanQueryRequest.Search))
        {
            var term = loanQueryRequest.Search.Trim().TrimStart('#');

            query = int.TryParse(term, out var reference)
                ? query.Where(l => l.LoanId == reference)
                : query.Where(l => false);
        }

        return await query
            .Include(l => l.Status)
            .OrderByDescending(l => l.StartDate)
            .ThenByDescending(l => l.LoanId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
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
