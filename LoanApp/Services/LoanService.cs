using Constants;
using Data;
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
}
