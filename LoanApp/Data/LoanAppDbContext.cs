using Constants;
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
    modelBuilder.Entity<FundRelease>().Property(f => f.Amount).HasPrecision(18, 2);

    modelBuilder.Entity<User>()
    .HasIndex(u => new { u.TenantId, u.UserName })
    .IsUnique();

    modelBuilder.Entity<Account>()
    .HasIndex(a => a.UserId)
    .IsUnique();

    modelBuilder.Entity<Account>()
    .HasOne(a => a.User)
    .WithOne(u => u.Account)
    .HasForeignKey<Account>(a => a.UserId);

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

    modelBuilder.Entity<Transaction>()
    .HasOne(t => t.Ledger)
    .WithMany(l => l.Transactions);

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

    modelBuilder.Entity<ReviewApplication>()
    .HasOne(r => r.LoanApplication)
    .WithMany(l => l.Reviews);

    modelBuilder.Entity<LoanApproval>()
    .HasOne(a => a.LoanApplication)
    .WithMany(l => l.Approvals);

    modelBuilder.Entity<LoanApproval>()
    .HasIndex(a => a.LoanApplicationId)
    .IsUnique();

    modelBuilder.Entity<LoanApproval>()
    .HasOne(l => l.Approver)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<LoanApproval>()
    .HasOne(l => l.Status)
    .WithMany()
    .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Role>().HasData(
      new Role { RoleId = 1, Name = RoleNames.Admin },
      new Role { RoleId = 2, Name = RoleNames.Reviewer },
      new Role { RoleId = 3, Name = RoleNames.Approver },
      new Role { RoleId = 4, Name = RoleNames.Loaner }
    );

    modelBuilder.Entity<Tenant>().HasData(
      new Tenant { TenantId = 1, Name = "Jitsu Finance", CreatedAt = new DateTime(2026, 1, 1), IsActive = true },
      new Tenant { TenantId = 2, Name = "Mejia Finance", CreatedAt = new DateTime(2026, 1, 1), IsActive = true }
    );

    modelBuilder.Entity<Interest>().HasData(
      new Interest { InterestId = 1, InterestRate = 5.5m },
      new Interest { InterestId = 2, InterestRate = 13m }
    );

    modelBuilder.Entity<PaymentPlan>().HasData(
      new PaymentPlan { PaymentPlanId = 1, InterestId = 1, Name = "Standard", NumberOfMonths = 2 },
      new PaymentPlan { PaymentPlanId = 2, InterestId = 2, Name = "Extended", NumberOfMonths = 4 }
    );

    modelBuilder.Entity<StatusCategory>().HasData(
      new StatusCategory { StatusCategoryId = 1, Code = StatusCategoryCodes.LoanApplicationStatus },
      new StatusCategory { StatusCategoryId = 2, Code = StatusCategoryCodes.LoanStatus }
    );

    modelBuilder.Entity<Status>().HasData(
      new Status { StatusId = 1, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.PendingReview, Label = "Pending Review" },
      new Status { StatusId = 2, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.PendingApproval, Label = "Pending Approval" },
      new Status { StatusId = 3, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.PendingRelease, Label = "Pending Release" },
      new Status { StatusId = 4, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.Released, Label = "Released" },
      new Status { StatusId = 5, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.ReturnedByReviewer, Label = "Returned by Reviewer" },
      new Status { StatusId = 7, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.Rejected, Label = "Rejected" },
      new Status { StatusId = 8, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.Cancelled, Label = "Cancelled" },
      new Status { StatusId = 9, StatusCategoryId = 1, Code = LoanApplicationStatusCodes.Approved, Label = "Approved" },
      new Status { StatusId = 10, StatusCategoryId = 2, Code = LoanLifecycleCodes.Active, Label = "Active" },
      new Status { StatusId = 11, StatusCategoryId = 2, Code = LoanLifecycleCodes.Paid, Label = "Fully Paid" },
      new Status { StatusId = 12, StatusCategoryId = 2, Code = LoanLifecycleCodes.Overdue, Label = "Overdue" },
      new Status { StatusId = 13, StatusCategoryId = 2, Code = LoanLifecycleCodes.Defaulted, Label = "Defaulted" }
    );

    modelBuilder.Entity<TransactionType>().HasData(
      new TransactionType { TransactionTypeId = 1, Code = TransactionTypeCodes.CapitalDeposit, Label = "Capital Deposit" },
      new TransactionType { TransactionTypeId = 2, Code = TransactionTypeCodes.Correction, Label = "Correction" },
      new TransactionType { TransactionTypeId = 3, Code = TransactionTypeCodes.FundRelease, Label = "Fund Release" },
      new TransactionType { TransactionTypeId = 4, Code = TransactionTypeCodes.Payment, Label = "Payment" }
    );

    modelBuilder.Entity<Ledger>().HasData(
      new Ledger { LedgerId = 1, TenantId = 1, Name = "Jitsu Finance Operating", CurrentBalance = 0m },
      new Ledger { LedgerId = 2, TenantId = 2, Name = "Mejia Finance Operating", CurrentBalance = 0m }
    );

    modelBuilder.Entity<User>().HasData(
      new User { UserId = 1, TenantId = 1, RoleId = 1, UserName = "j.admin", PasswordHash = SeedPasswordHashes.JitsuAdmin },
      new User { UserId = 2, TenantId = 1, RoleId = 2, UserName = "j.reviewer", PasswordHash = SeedPasswordHashes.JitsuReviewer },
      new User { UserId = 3, TenantId = 1, RoleId = 3, UserName = "j.approver", PasswordHash = SeedPasswordHashes.JitsuApprover },
      new User { UserId = 4, TenantId = 2, RoleId = 1, UserName = "m.admin", PasswordHash = SeedPasswordHashes.MejiaAdmin },
      new User { UserId = 5, TenantId = 2, RoleId = 2, UserName = "m.reviewer", PasswordHash = SeedPasswordHashes.MejiaReviewer },
      new User { UserId = 6, TenantId = 2, RoleId = 3, UserName = "m.approver", PasswordHash = SeedPasswordHashes.MejiaApprover }
    );

    modelBuilder.Entity<Account>().HasData(
      new Account { AccountId = 1, UserId = 1, FirstName = "Alo", LastName = "Santos", Birthdate = new DateTime(1990, 1, 1) },
      new Account { AccountId = 2, UserId = 2, FirstName = "Luwi", LastName = "Santos", Birthdate = new DateTime(1990, 1, 1) },
      new Account { AccountId = 3, UserId = 3, FirstName = "Ampol", LastName = "Santos", Birthdate = new DateTime(1990, 1, 1) },
      new Account { AccountId = 4, UserId = 4, FirstName = "Alo", LastName = "Reyes", Birthdate = new DateTime(1990, 1, 1) },
      new Account { AccountId = 5, UserId = 5, FirstName = "Luwi", LastName = "Reyes", Birthdate = new DateTime(1990, 1, 1) },
      new Account { AccountId = 6, UserId = 6, FirstName = "Ampol", LastName = "Reyes", Birthdate = new DateTime(1990, 1, 1) }
    );
  }
}