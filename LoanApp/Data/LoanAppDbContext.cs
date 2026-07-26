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

    modelBuilder.Entity<User>()
    .HasOne(u => u.Tenant)
    .WithMany(t => t.Users)
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<CapitalDeposit>()
    .HasOne(c => c.PostedBy)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Correction>()
    .HasOne(c => c.CorrectedTransaction)
    .WithOne()
    .HasForeignKey<Correction>(c => c.CorrectedTransactionId)
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Correction>()
    .HasOne(c => c.PostedBy)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<LoanApplication>()
    .HasOne(l => l.Borrower)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<User>()
    .HasOne(u => u.Role)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Transaction>()
    .HasOne(t => t.TransactionType)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Correction>()
    .HasOne(c => c.Ledger)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<FundRelease>()
    .HasOne(f => f.ReleasedBy)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<FundRelease>()
    .HasOne(f => f.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Loan>()
    .HasOne(l => l.Borrower)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Loan>()
    .HasOne(l => l.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Payment>()
    .HasOne(p => p.Borrower)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<LoanApplication>()
    .HasOne(l => l.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<ReviewApplication>()
    .HasOne(r => r.Reviewer)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<ReviewApplication>()
    .HasOne(r => r.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<LoanApproval>()
    .HasOne(l => l.Approver)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<LoanApproval>()
    .HasOne(l => l.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Role>().HasData(
      new Role { RoleId = 1, Name = "Admin" },
      new Role { RoleId = 2, Name = "Reviewer" },
      new Role { RoleId = 3, Name = "Approver" },
      new Role { RoleId = 4, Name = "Loaner" }
    );

    modelBuilder.Entity<Tenant>().HasData(
      new Tenant { TenantId = 1, Name = "Jitsu Finance", CreatedAt = new DateTime(2026, 1, 1), IsActive = true },
      new Tenant { TenantId = 2, Name = "Mejia Finance", CreatedAt = new DateTime(2026, 1, 1), IsActive = true }
    );
  }
}