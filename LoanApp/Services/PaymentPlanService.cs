using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class PaymentPlanService
{
    private readonly LoanAppDbContext _context;

    public PaymentPlanService (LoanAppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Every plan on offer. Reference data, not tenant data — PaymentPlans has no
    /// TenantId, so there is nothing to scope here.
    ///
    /// Interest is Included because the rate lives on that row and PaymentPlanResponse
    /// reads it; without the Include the projection throws on a null navigation.
    /// Ordered by term so the picker is stable rather than in whatever order the server
    /// found convenient.
    /// </summary>
    public async Task<List<PaymentPlan>> GetPaymentPlansAsync ()
    {
        var paymentPlans = await _context.PaymentPlans
            .Include(p => p.Interest)
            .OrderBy(p => p.NumberOfMonths)
            .ThenBy(p => p.PaymentPlanId)
            .ToListAsync();

        return paymentPlans;
    }

    public async Task<PaymentPlan?> GetPaymentPlanByMonthAsync (int numberOfMonths)
    {
        var targetPaymentPlan = await _context.PaymentPlans.FirstOrDefaultAsync(p => p.NumberOfMonths == numberOfMonths);
        return targetPaymentPlan;
    }

    public async Task<PaymentPlan?> GetPaymentPlanByIdAsync (int paymentPlanId)
    {
        var paymentPlan = await _context.PaymentPlans.FirstOrDefaultAsync(p => p.PaymentPlanId == paymentPlanId);
        return paymentPlan;
    }
}