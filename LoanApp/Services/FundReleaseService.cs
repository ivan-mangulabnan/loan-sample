using Constants;
using Data;
using Dtos.Requests;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class FundReleaseService
{
    private readonly LoanAppDbContext _context;
    private readonly StatusService _statusService;
    private readonly LedgerService _ledgerService;
    private readonly LoanService _loanService;

    public FundReleaseService (LoanAppDbContext context, StatusService statusService, LedgerService ledgerService, LoanService loanService)
    {
        _context = context;
        _statusService = statusService;
        _ledgerService = ledgerService;
        _loanService = loanService;
    }
    
    /// <summary>
    /// The disbursement desk. Rooted on LoanApproval rather than the application, because
    /// the principal being released is the approval's figure — the application's Amount is
    /// what was asked for, not what was granted.
    ///
    /// No AsSplitQuery here: every Include on this query is a reference, so there is no
    /// collection to fan out and a single query returns exactly one row per approval.
    /// </summary>
    public async Task<List<LoanApproval>> GetQueueAsync (
        int tenantId, ApplicationQueryRequest applicationQueryRequest)
    {
        var query = _context.LoanApprovals
            .Where(a => a.LoanApplication.Borrower.TenantId == tenantId
                     && a.LoanApplication.Status.Code == LoanApplicationStatusCodes.PendingRelease);

        query = ApplySearch(query, applicationQueryRequest.Search);

        return await query
            .Include(a => a.Approver).ThenInclude(u => u.Account)
            .Include(a => a.Status)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Borrower).ThenInclude(b => b.Account)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Status)
            .Include(a => a.LoanApplication).ThenInclude(l => l.PaymentPlan)
            // LoanApprovalId breaks ties: ApprovalDate is a UtcNow stamp, so two decisions
            // recorded in the same tick would otherwise swap places between requests, and
            // the client pages this list by position.
            .OrderBy(a => a.ApprovalDate)
            .ThenBy(a => a.LoanApprovalId)
            .Take(ListLimit.MaxRows)
            .ToListAsync();
    }

    /// <summary>
    /// Matches the same two things the application queues do — reference number or
    /// borrower name — but reaches them through LoanApplication, since this query is
    /// rooted one level up. The reference shown in the UI is the application's, not the
    /// approval's, so that is what a typed "#12" has to hit.
    ///
    /// Columns rather than PersonName.Of, and no ToLower: see LoanApplicationQueries.
    /// </summary>
    private static IQueryable<LoanApproval> ApplySearch (IQueryable<LoanApproval> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var term = search.Trim().TrimStart('#');
        if (term.Length == 0) return query;

        if (int.TryParse(term, out var reference))
            return query.Where(a => a.LoanApplicationId == reference);

        return query.Where(a => a.LoanApplication.Borrower.Account != null
                             && (a.LoanApplication.Borrower.Account.FirstName.Contains(term)
                              || a.LoanApplication.Borrower.Account.LastName.Contains(term)));
    }

    /// <summary>
    /// The disbursement desk's write. Both outcomes land here: releasing pays the
    /// borrower and draws down the operating ledger, rejecting closes the application
    /// without moving a centavo. Named for the decision rather than the release because
    /// half its work is the refusal.
    ///
    /// Rooted on LoanApproval for the same reason the queue is — the figure at stake is
    /// the approval's principal, not the amount the borrower originally asked for.
    /// </summary>
    public async Task<FundRelease?> DecideAsync (int adminUserId, int tenantId, FundReleaseRequest fundReleaseRequest)
    {
        var loanApproval = await _context.LoanApprovals
            .Include(a => a.LoanApplication).ThenInclude(l => l.Borrower)
            .Include(a => a.LoanApplication).ThenInclude(l => l.Status)
            .FirstOrDefaultAsync(a => a.LoanApprovalId == fundReleaseRequest.LoanApprovalId
                                   && a.LoanApplication.Borrower.TenantId == tenantId);

        if (loanApproval is null) return null;

        var loanApplication = loanApproval.LoanApplication;

        if (loanApplication.Status.Code != LoanApplicationStatusCodes.PendingRelease)
            throw new InvalidOperationException($"Cannot act on an application with status '{loanApplication.Status.Code}'.");

        if (fundReleaseRequest.Decision is Decision.Reject
            && string.IsNullOrWhiteSpace(fundReleaseRequest.Remarks))
            throw new InvalidOperationException(
                "Remarks are required when rejecting a release.");

        return fundReleaseRequest.Decision switch
        {
            Decision.Approve => await ReleaseAsync(adminUserId, tenantId, loanApproval, fundReleaseRequest.Remarks),
            Decision.Reject => await RejectAsync(adminUserId, loanApproval, fundReleaseRequest.Remarks),
            _ => throw new InvalidOperationException(
                "The release desk can only release or reject; returning is a reviewer decision.")
        };
    }

    /// <summary>
    /// Pays out. Four tables move together — FundReleases, Loans, Transactions and the
    /// Ledger — plus the application's own status, which is why this one carries an
    /// explicit transaction while the rejection does not.
    /// </summary>
    private async Task<FundRelease> ReleaseAsync (int adminUserId, int tenantId, LoanApproval loanApproval, string? remarks)
    {
        var loanApplication = loanApproval.LoanApplication;
        var ledger = await _ledgerService.GetOperatingLedgerAsync(tenantId);
        var amount = loanApproval.PrincipalAmount;

        if (ledger.CurrentBalance < amount)
            throw new InvalidOperationException(
                $"Insufficient funds: ledger holds {ledger.CurrentBalance:N2}, release requires {amount:N2}.");

        var releasedStatus = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.Released);
        var transactionTypeId = await _ledgerService.GetTransactionTypeIdAsync(TransactionTypeCodes.FundRelease);

        var fundRelease = new FundRelease
        {
            LoanApprovalId = loanApproval.LoanApprovalId,
            ReleasedByUserId = adminUserId,
            StatusId = releasedStatus.StatusId,
            Amount = amount,
            ReleaseDate = DateTime.UtcNow,
            Remarks = remarks
        };

        await using var databaseTransaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.FundReleases.Add(fundRelease);
            await _context.SaveChangesAsync();

            await _loanService.CreateFromReleaseAsync(loanApproval, fundRelease);

            _context.Transactions.Add(new Transaction
            {
                LedgerId = ledger.LedgerId,
                TransactionTypeId = transactionTypeId,
                ReferenceId = fundRelease.FundReleaseId,
                Amount = -amount,
                CreatedAt = DateTime.UtcNow
            });

            ledger.CurrentBalance -= amount;
            loanApplication.StatusId = releasedStatus.StatusId;
            await _context.SaveChangesAsync();

            await databaseTransaction.CommitAsync();
        }
        catch
        {
            await databaseTransaction.RollbackAsync();
            throw;
        }

        return fundRelease;
    }

    /// <summary>
    /// Refuses to pay out. The application goes terminal at REJECTED and no loan is
    /// created.
    ///
    /// Two absences are load-bearing. There is no ledger sufficiency check: an empty
    /// ledger is the likeliest reason to reject, and gating the refusal on the money
    /// being there would leave the application stuck at PENDING_RELEASE with no way out.
    /// And there is no explicit database transaction: this writes one row and updates
    /// one, so a single SaveChangesAsync is already atomic.
    ///
    /// The row is still written, with Amount 0 — nothing moved, and what was refused is
    /// one join away on LoanApproval.PrincipalAmount. It exists so the refusal has an
    /// author and a reason, the same way a rejected review or approval does.
    /// </summary>
    private async Task<FundRelease> RejectAsync (int adminUserId, LoanApproval loanApproval, string? remarks)
    {
        var rejectedStatus = await _statusService.GetRequiredApplicationStatusAsync(LoanApplicationStatusCodes.Rejected);

        var fundRelease = new FundRelease
        {
            LoanApprovalId = loanApproval.LoanApprovalId,
            ReleasedByUserId = adminUserId,
            StatusId = rejectedStatus.StatusId,
            Amount = 0m,
            ReleaseDate = DateTime.UtcNow,
            Remarks = remarks
        };

        loanApproval.LoanApplication.StatusId = rejectedStatus.StatusId;

        _context.FundReleases.Add(fundRelease);
        await _context.SaveChangesAsync();

        return fundRelease;
    }
}
