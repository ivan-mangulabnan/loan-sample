using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {

    }

    public DbSet<Users> Users { get; set; }
    public DbSet<Accounts> Accounts { get; set; }
    public DbSet<Loans> Loans { get; set; }
    public DbSet<LoanApplication> LoanApplications { get; set; }
    public DbSet<LoanApproval> LoanApprovals { get; set; }
    public DbSet<Payments> Payments { get; set; }
    public DbSet<PaymentPlan> PaymentPlans { get; set; }
    public DbSet<Interests> Interests { get; set; }
    public DbSet<FundRelease> FundReleases { get; set; }
    public DbSet<ReviewApplication> ReviewApplications { get; set; }
    public DbSet<Roles> Roles { get; set; }
    public DbSet<Status> Statuses { get; set; }
    public DbSet<StatusCategory> StatusCategories { get; set; }
    public DbSet<Tenants> Tenants { get; set; }
    
}