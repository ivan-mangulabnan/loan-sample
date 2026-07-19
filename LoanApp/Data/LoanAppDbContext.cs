using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class LoanAppDbContext : DbContext
{
  public LoanAppDbContext(DbContextOptions<LoanAppDbContext> options) : base(options) { }

  public DbSet<Tenant> Tenants { get; set; }
  public DbSet<User> Users { get; set; }
  public DbSet<Account> Accounts { get; set; }
  public DbSet<Role> Roles { get; set; }
  public DbSet<Ledger> Ledgers { get; set; }
  public DbSet<Transaction> Transactions { get; set; }
  public DbSet<CapitalDeposit> CapitalDeposits { get; set; }
  public DbSet<FundRelease> FundReleases { get; set; }
  public DbSet<Payment> Payments { get; set; }
  public DbSet<Correction> Corrections { get; set; }
  public DbSet<LoanApplication> LoanApplications { get; set; }
  public DbSet<ReviewApplication> ReviewApplications { get; set; }
  public DbSet<LoanApproval> LoanApprovals { get; set; }
  public DbSet<Loan> Loans { get; set; }
  public DbSet<Interest> Interests { get; set; }
  public DbSet<PaymentPlan> PaymentPlans { get; set; }
  public DbSet<Status> Statuses { get; set; }
  public DbSet<StatusCategory> StatusCategories { get; set; }
  public DbSet<TransactionType> TransactionTypes { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<Interest>().Property(i => i.InterestRate).HasPrecision(9, 6);
    modelBuilder.Entity<LoanApproval>().Property(l => l.InterestRate).HasPrecision(9, 6);
    modelBuilder.Entity<Loan>().Property(l => l.InterestRate).HasPrecision(9, 6);

    modelBuilder.Entity<CapitalDeposit>().Property(c => c.Amount).HasPrecision(18, 2);
    modelBuilder.Entity<Correction>().Property(c => c.Amount).HasPrecision(18, 2);
    modelBuilder.Entity<Ledger>().Property(l => l.CurrentBalance).HasPrecision(18, 2);
    modelBuilder.Entity<Loan>().Property(l => l.Balance).HasPrecision(18, 2);
    modelBuilder.Entity<Loan>().Property(l => l.PrincipalAmount).HasPrecision(18, 2);
    modelBuilder.Entity<Loan>().Property(l => l.TotalRepaymentAmount).HasPrecision(18, 2);
    modelBuilder.Entity<LoanApplication>().Property(l => l.Amount).HasPrecision(18, 2);
    modelBuilder.Entity<LoanApproval>().Property(l => l.PrincipalAmount).HasPrecision(18, 2);
    modelBuilder.Entity<LoanApproval>().Property(l => l.TotalRepaymentAmount).HasPrecision(18, 2);
    modelBuilder.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2);
    modelBuilder.Entity<Transaction>().Property(t => t.Amount).HasPrecision(18, 2);

    modelBuilder.Entity<User>()
    .HasIndex(u => new { u.TenantId, u.UserName })
    .IsUnique();

    modelBuilder.Entity<Account>()
    .HasIndex(a => a.UserId)
    .IsUnique();

    modelBuilder.Entity<Loan>()
    .HasIndex(l => l.FundReleaseId)
    .IsUnique();
  }
}