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

    public async Task<List<PaymentPlan>> GetPaymentPlansAsync ()
    {
        var paymentPlans = await _context.PaymentPlans.ToListAsync();
        return paymentPlans;
    }

    public async Task<PaymentPlan?> GetPaymentPlanByMonthAsync (int numberOfMonths)
    {
        var targetPaymentPlan = await _context.PaymentPlans.FirstOrDefaultAsync(p => p.NumberOfMonths == numberOfMonths);
        return targetPaymentPlan;
    }
}