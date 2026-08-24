using System;
using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace LoanApp.Migrations
{
    [DbContext(typeof(LoanAppDbContext))]
    [Migration("20260809071319_TerminalApproval")]
    partial class TerminalApproval
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Models.Account", b =>
                {
                    b.Property<int>("AccountId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("AccountId"));

                    b.Property<DateTime>("Birthdate")
                        .HasColumnType("datetime2");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MiddleName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("AccountId");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("Accounts");

                    b.HasData(
                        new
                        {
                            AccountId = 1,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Alo",
                            LastName = "Santos",
                            UserId = 1
                        },
                        new
                        {
                            AccountId = 2,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Luwi",
                            LastName = "Santos",
                            UserId = 2
                        },
                        new
                        {
                            AccountId = 3,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Ampol",
                            LastName = "Santos",
                            UserId = 3
                        },
                        new
                        {
                            AccountId = 4,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Alo",
                            LastName = "Reyes",
                            UserId = 4
                        },
                        new
                        {
                            AccountId = 5,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Luwi",
                            LastName = "Reyes",
                            UserId = 5
                        },
                        new
                        {
                            AccountId = 6,
                            Birthdate = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            FirstName = "Ampol",
                            LastName = "Reyes",
                            UserId = 6
                        });
                });

            modelBuilder.Entity("Models.CapitalDeposit", b =>
                {
                    b.Property<int>("CapitalDepositId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CapitalDepositId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTime>("DatePosted")
                        .HasColumnType("datetime2");

                    b.Property<int>("LedgerId")
                        .HasColumnType("int");

                    b.Property<int>("PostedByUserId")
                        .HasColumnType("int");

                    b.HasKey("CapitalDepositId");

                    b.HasIndex("LedgerId");

                    b.HasIndex("PostedByUserId");

                    b.ToTable("CapitalDeposits");
                });

            modelBuilder.Entity("Models.Correction", b =>
                {
                    b.Property<int>("CorrectionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CorrectionId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("CorrectedTransactionId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DatePosted")
                        .HasColumnType("datetime2");

                    b.Property<int>("LedgerId")
                        .HasColumnType("int");

                    b.Property<int>("PostedByUserId")
                        .HasColumnType("int");

                    b.Property<string>("Remarks")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("CorrectionId");

                    b.HasIndex("CorrectedTransactionId")
                        .IsUnique();

                    b.HasIndex("LedgerId");

                    b.HasIndex("PostedByUserId");

                    b.ToTable("Corrections");
                });

            modelBuilder.Entity("Models.FundRelease", b =>
                {
                    b.Property<int>("FundReleaseId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("FundReleaseId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("LoanApprovalId")
                        .HasColumnType("int");

                    b.Property<DateTime>("ReleaseDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("ReleasedByUserId")
                        .HasColumnType("int");

                    b.Property<string>("Remarks")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("StatusId")
                        .HasColumnType("int");

                    b.HasKey("FundReleaseId");

                    b.HasIndex("LoanApprovalId");

                    b.HasIndex("ReleasedByUserId");

                    b.HasIndex("StatusId");

                    b.ToTable("FundReleases");
                });

            modelBuilder.Entity("Models.Interest", b =>
                {
                    b.Property<int>("InterestId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("InterestId"));

                    b.Property<decimal>("InterestRate")
                        .HasPrecision(9, 6)
                        .HasColumnType("decimal(9,6)");

                    b.HasKey("InterestId");

                    b.ToTable("Interests");

                    b.HasData(
                        new
                        {
                            InterestId = 1,
                            InterestRate = 5.5m
                        },
                        new
                        {
                            InterestId = 2,
                            InterestRate = 13m
                        });
                });

            modelBuilder.Entity("Models.Ledger", b =>
                {
                    b.Property<int>("LedgerId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("LedgerId"));

                    b.Property<decimal>("CurrentBalance")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("TenantId")
                        .HasColumnType("int");

                    b.HasKey("LedgerId");

                    b.HasIndex("TenantId");

                    b.ToTable("Ledgers");

                    b.HasData(
                        new
                        {
                            LedgerId = 1,
                            CurrentBalance = 0m,
                            Name = "Jitsu Finance Operating",
                            TenantId = 1
                        },
                        new
                        {
                            LedgerId = 2,
                            CurrentBalance = 0m,
                            Name = "Mejia Finance Operating",
                            TenantId = 2
                        });
                });

            modelBuilder.Entity("Models.Loan", b =>
                {
                    b.Property<int>("LoanId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("LoanId"));

                    b.Property<decimal>("Balance")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("BorrowerId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DueDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("FundReleaseId")
                        .HasColumnType("int");

                    b.Property<decimal>("InterestRate")
                        .HasPrecision(9, 6)
                        .HasColumnType("decimal(9,6)");

                    b.Property<int>("NumberOfMonths")
                        .HasColumnType("int");

                    b.Property<decimal>("PrincipalAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("StatusId")
                        .HasColumnType("int");

                    b.Property<decimal>("TotalRepaymentAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("LoanId");

                    b.HasIndex("BorrowerId");

                    b.HasIndex("FundReleaseId")
                        .IsUnique();

                    b.HasIndex("StatusId");

                    b.ToTable("Loans");
                });

            modelBuilder.Entity("Models.LoanApplication", b =>
                {
                    b.Property<int>("LoanApplicationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("LoanApplicationId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("BorrowerId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DateRequested")
                        .HasColumnType("datetime2");

                    b.Property<int>("PaymentPlanId")
                        .HasColumnType("int");

                    b.Property<int>("StatusId")
                        .HasColumnType("int");

                    b.HasKey("LoanApplicationId");

                    b.HasIndex("BorrowerId");

                    b.HasIndex("PaymentPlanId");

                    b.HasIndex("StatusId");

                    b.ToTable("LoanApplications");
                });

            modelBuilder.Entity("Models.LoanApproval", b =>
                {
                    b.Property<int>("LoanApprovalId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("LoanApprovalId"));

                    b.Property<DateTime>("ApprovalDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("ApproverId")
                        .HasColumnType("int");

                    b.Property<decimal>("InterestRate")
                        .HasPrecision(9, 6)
                        .HasColumnType("decimal(9,6)");

                    b.Property<int>("LoanApplicationId")
                        .HasColumnType("int");

                    b.Property<int>("NumberOfMonths")
                        .HasColumnType("int");

                    b.Property<decimal>("PrincipalAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Remarks")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("StatusId")
                        .HasColumnType("int");

                    b.Property<decimal>("TotalRepaymentAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("LoanApprovalId");

                    b.HasIndex("ApproverId");

                    b.HasIndex("LoanApplicationId")
                        .IsUnique();

                    b.HasIndex("StatusId");

                    b.ToTable("LoanApprovals");
                });

            modelBuilder.Entity("Models.Payment", b =>
                {
                    b.Property<int>("PaymentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PaymentId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("BorrowerUserId")
                        .HasColumnType("int");

                    b.Property<int>("LoanId")
                        .HasColumnType("int");

                    b.Property<DateTime>("PaymentDate")
                        .HasColumnType("datetime2");

                    b.HasKey("PaymentId");

                    b.HasIndex("BorrowerUserId");

                    b.HasIndex("LoanId");

                    b.ToTable("Payments");
                });

            modelBuilder.Entity("Models.PaymentPlan", b =>
                {
                    b.Property<int>("PaymentPlanId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PaymentPlanId"));

                    b.Property<int>("InterestId")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("NumberOfMonths")
                        .HasColumnType("int");

                    b.HasKey("PaymentPlanId");

                    b.HasIndex("InterestId");

                    b.ToTable("PaymentPlans");

                    b.HasData(
                        new
                        {
                            PaymentPlanId = 1,
                            InterestId = 1,
                            Name = "Standard",
                            NumberOfMonths = 2
                        },
                        new
                        {
                            PaymentPlanId = 2,
                            InterestId = 2,
                            Name = "Extended",
                            NumberOfMonths = 4
                        });
                });

            modelBuilder.Entity("Models.ReviewApplication", b =>
                {
                    b.Property<int>("ReviewApplicationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ReviewApplicationId"));

                    b.Property<DateTime>("DatePosted")
                        .HasColumnType("datetime2");

                    b.Property<int>("LoanApplicationId")
                        .HasColumnType("int");

                    b.Property<string>("Remarks")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ReviewerId")
                        .HasColumnType("int");

                    b.Property<int>("StatusId")
                        .HasColumnType("int");

                    b.HasKey("ReviewApplicationId");

                    b.HasIndex("LoanApplicationId");

                    b.HasIndex("ReviewerId");

                    b.HasIndex("StatusId");

                    b.ToTable("ReviewApplications");
                });

            modelBuilder.Entity("Models.Role", b =>
                {
                    b.Property<int>("RoleId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("RoleId"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("RoleId");

                    b.ToTable("Roles");

                    b.HasData(
                        new
                        {
                            RoleId = 1,
                            Name = "Admin"
                        },
                        new
                        {
                            RoleId = 2,
                            Name = "Reviewer"
                        },
                        new
                        {
                            RoleId = 3,
                            Name = "Approver"
                        },
                        new
                        {
                            RoleId = 4,
                            Name = "Loaner"
                        });
                });

            modelBuilder.Entity("Models.Status", b =>
                {
                    b.Property<int>("StatusId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StatusId"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Label")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("StatusCategoryId")
                        .HasColumnType("int");

                    b.HasKey("StatusId");

                    b.HasIndex("StatusCategoryId");

                    b.ToTable("Statuses");

                    b.HasData(
                        new
                        {
                            StatusId = 1,
                            Code = "PENDING_REVIEW",
                            Label = "Pending Review",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 2,
                            Code = "PENDING_APPROVAL",
                            Label = "Pending Approval",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 3,
                            Code = "PENDING_RELEASE",
                            Label = "Pending Release",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 4,
                            Code = "RELEASED",
                            Label = "Released",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 5,
                            Code = "RETURNED_BY_REVIEWER",
                            Label = "Returned by Reviewer",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 7,
                            Code = "REJECTED",
                            Label = "Rejected",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 8,
                            Code = "CANCELLED",
                            Label = "Cancelled",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 9,
                            Code = "APPROVED",
                            Label = "Approved",
                            StatusCategoryId = 1
                        },
                        new
                        {
                            StatusId = 10,
                            Code = "ACTIVE",
                            Label = "Active",
                            StatusCategoryId = 2
                        },
                        new
                        {
                            StatusId = 11,
                            Code = "PAID",
                            Label = "Fully Paid",
                            StatusCategoryId = 2
                        },
                        new
                        {
                            StatusId = 12,
                            Code = "OVERDUE",
                            Label = "Overdue",
                            StatusCategoryId = 2
                        },
                        new
                        {
                            StatusId = 13,
                            Code = "DEFAULTED",
                            Label = "Defaulted",
                            StatusCategoryId = 2
                        });
                });

            modelBuilder.Entity("Models.StatusCategory", b =>
                {
                    b.Property<int>("StatusCategoryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("StatusCategoryId"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("StatusCategoryId");

                    b.ToTable("StatusCategories");

                    b.HasData(
                        new
                        {
                            StatusCategoryId = 1,
                            Code = "LOAN_APPLICATION_STATUS"
                        },
                        new
                        {
                            StatusCategoryId = 2,
                            Code = "LOAN_STATUS"
                        });
                });

            modelBuilder.Entity("Models.Tenant", b =>
                {
                    b.Property<int>("TenantId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TenantId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("TenantId");

                    b.ToTable("Tenants");

                    b.HasData(
                        new
                        {
                            TenantId = 1,
                            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            IsActive = true,
                            Name = "Jitsu Finance"
                        },
                        new
                        {
                            TenantId = 2,
                            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            IsActive = true,
                            Name = "Mejia Finance"
                        });
                });

            modelBuilder.Entity("Models.Transaction", b =>
                {
                    b.Property<int>("TransactionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TransactionId"));

                    b.Property<decimal>("Amount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("LedgerId")
                        .HasColumnType("int");

                    b.Property<int>("ReferenceId")
                        .HasColumnType("int");

                    b.Property<int>("TransactionTypeId")
                        .HasColumnType("int");

                    b.HasKey("TransactionId");

                    b.HasIndex("LedgerId");

                    b.HasIndex("TransactionTypeId");

                    b.ToTable("Transactions");
                });

            modelBuilder.Entity("Models.TransactionType", b =>
                {
                    b.Property<int>("TransactionTypeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TransactionTypeId"));

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Label")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("TransactionTypeId");

                    b.ToTable("TransactionTypes");

                    b.HasData(
                        new
                        {
                            TransactionTypeId = 1,
                            Code = "CAPITAL_DEPOSIT",
                            Label = "Capital Deposit"
                        },
                        new
                        {
                            TransactionTypeId = 2,
                            Code = "CORRECTION",
                            Label = "Correction"
                        },
                        new
                        {
                            TransactionTypeId = 3,
                            Code = "FUND_RELEASE",
                            Label = "Fund Release"
                        },
                        new
                        {
                            TransactionTypeId = 4,
                            Code = "PAYMENT",
                            Label = "Payment"
                        });
                });

            modelBuilder.Entity("Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("RoleId")
                        .HasColumnType("int");

                    b.Property<int>("TenantId")
                        .HasColumnType("int");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId");

                    b.HasIndex("RoleId");

                    b.HasIndex("TenantId", "UserName")
                        .IsUnique();

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            UserId = 1,
                            PasswordHash = "AQAAAAEAACcQAAAAEKvOGE+ATfpFd9wZ+1zUGOWKFMC2JKkGu+BSKWYXi7oBab2KEJ3KUNkqu/XXq771Zw==",
                            RoleId = 1,
                            TenantId = 1,
                            UserName = "j.admin"
                        },
                        new
                        {
                            UserId = 2,
                            PasswordHash = "AQAAAAEAACcQAAAAEGE2jfRdx10ZGmYlr1HyuyDS7b++xIoN9M1gYpk/EuHULF3UBIvEJRXA1SnecrTPuA==",
                            RoleId = 2,
                            TenantId = 1,
                            UserName = "j.reviewer"
                        },
                        new
                        {
                            UserId = 3,
                            PasswordHash = "AQAAAAEAACcQAAAAEGWKLL3uBfsK5IRwUMe1XaTr8nQxfW8T2l1Mppi7g4ZptA6Pl8QWGDIcAiAAKTUQbw==",
                            RoleId = 3,
                            TenantId = 1,
                            UserName = "j.approver"
                        },
                        new
                        {
                            UserId = 4,
                            PasswordHash = "AQAAAAEAACcQAAAAEDOCUsFtT4h2mZK/Tes9OlJY6wawHkvmeLP7MT1o2M+yYJMkK2P/9VBHX/MXeHj2pA==",
                            RoleId = 1,
                            TenantId = 2,
                            UserName = "m.admin"
                        },
                        new
                        {
                            UserId = 5,
                            PasswordHash = "AQAAAAEAACcQAAAAEOod2TWAHlBWmZrUZYRtX8NlwBkUW8fa/m8oSHly5P/x56xDJUdL4e8+c3i0T0UCqg==",
                            RoleId = 2,
                            TenantId = 2,
                            UserName = "m.reviewer"
                        },
                        new
                        {
                            UserId = 6,
                            PasswordHash = "AQAAAAEAACcQAAAAEFcQow6xcED8W1/PSL+OlkhYjqa98PxRE6wyLWHal5VU1GiYJ0bTPu+0ryuHOYqTOQ==",
                            RoleId = 3,
                            TenantId = 2,
                            UserName = "m.approver"
                        });
                });

            modelBuilder.Entity("Models.Account", b =>
                {
                    b.HasOne("Models.User", "User")
                        .WithOne("Account")
                        .HasForeignKey("Models.Account", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Models.CapitalDeposit", b =>
                {
                    b.HasOne("Models.Ledger", "Ledger")
                        .WithMany()
                        .HasForeignKey("LedgerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.User", "PostedBy")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Ledger");

                    b.Navigation("PostedBy");
                });

            modelBuilder.Entity("Models.Correction", b =>
                {
                    b.HasOne("Models.Transaction", "CorrectedTransaction")
                        .WithOne()
                        .HasForeignKey("Models.Correction", "CorrectedTransactionId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Ledger", "Ledger")
                        .WithMany()
                        .HasForeignKey("LedgerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.User", "PostedBy")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("CorrectedTransaction");

                    b.Navigation("Ledger");

                    b.Navigation("PostedBy");
                });

            modelBuilder.Entity("Models.FundRelease", b =>
                {
                    b.HasOne("Models.LoanApproval", "LoanApproval")
                        .WithMany()
                        .HasForeignKey("LoanApprovalId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.User", "ReleasedBy")
                        .WithMany()
                        .HasForeignKey("ReleasedByUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Status", "Status")
                        .WithMany()
                        .HasForeignKey("StatusId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("LoanApproval");

                    b.Navigation("ReleasedBy");

                    b.Navigation("Status");
                });

            modelBuilder.Entity("Models.Ledger", b =>
                {
                    b.HasOne("Models.Tenant", "Tenant")
                        .WithMany()
                        .HasForeignKey("TenantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Tenant");
                });

            modelBuilder.Entity("Models.Loan", b =>
                {
                    b.HasOne("Models.User", "Borrower")
                        .WithMany()
                        .HasForeignKey("BorrowerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.FundRelease", "FundRelease")
                        .WithMany()
                        .HasForeignKey("FundReleaseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.Status", "Status")
                        .WithMany()
                        .HasForeignKey("StatusId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Borrower");

                    b.Navigation("FundRelease");

                    b.Navigation("Status");
                });

            modelBuilder.Entity("Models.LoanApplication", b =>
                {
                    b.HasOne("Models.User", "Borrower")
                        .WithMany()
                        .HasForeignKey("BorrowerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.PaymentPlan", "PaymentPlan")
                        .WithMany()
                        .HasForeignKey("PaymentPlanId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.Status", "Status")
                        .WithMany()
                        .HasForeignKey("StatusId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Borrower");

                    b.Navigation("PaymentPlan");

                    b.Navigation("Status");
                });

            modelBuilder.Entity("Models.LoanApproval", b =>
                {
                    b.HasOne("Models.User", "Approver")
                        .WithMany()
                        .HasForeignKey("ApproverId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.LoanApplication", "LoanApplication")
                        .WithMany("Approvals")
                        .HasForeignKey("LoanApplicationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.Status", "Status")
                        .WithMany()
                        .HasForeignKey("StatusId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Approver");

                    b.Navigation("LoanApplication");

                    b.Navigation("Status");
                });

            modelBuilder.Entity("Models.Payment", b =>
                {
                    b.HasOne("Models.User", "Borrower")
                        .WithMany()
                        .HasForeignKey("BorrowerUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Loan", "Loan")
                        .WithMany()
                        .HasForeignKey("LoanId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Borrower");

                    b.Navigation("Loan");
                });

            modelBuilder.Entity("Models.PaymentPlan", b =>
                {
                    b.HasOne("Models.Interest", "Interest")
                        .WithMany()
                        .HasForeignKey("InterestId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Interest");
                });

            modelBuilder.Entity("Models.ReviewApplication", b =>
                {
                    b.HasOne("Models.LoanApplication", "LoanApplication")
                        .WithMany("Reviews")
                        .HasForeignKey("LoanApplicationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.User", "Reviewer")
                        .WithMany()
                        .HasForeignKey("ReviewerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Status", "Status")
                        .WithMany()
                        .HasForeignKey("StatusId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("LoanApplication");

                    b.Navigation("Reviewer");

                    b.Navigation("Status");
                });

            modelBuilder.Entity("Models.Status", b =>
                {
                    b.HasOne("Models.StatusCategory", "StatusCategory")
                        .WithMany()
                        .HasForeignKey("StatusCategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("StatusCategory");
                });

            modelBuilder.Entity("Models.Transaction", b =>
                {
                    b.HasOne("Models.Ledger", "Ledger")
                        .WithMany("Transactions")
                        .HasForeignKey("LedgerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Models.TransactionType", "TransactionType")
                        .WithMany()
                        .HasForeignKey("TransactionTypeId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Ledger");

                    b.Navigation("TransactionType");
                });

            modelBuilder.Entity("Models.User", b =>
                {
                    b.HasOne("Models.Role", "Role")
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Models.Tenant", "Tenant")
                        .WithMany("Users")
                        .HasForeignKey("TenantId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Role");

                    b.Navigation("Tenant");
                });

            modelBuilder.Entity("Models.Ledger", b =>
                {
                    b.Navigation("Transactions");
                });

            modelBuilder.Entity("Models.LoanApplication", b =>
                {
                    b.Navigation("Approvals");

                    b.Navigation("Reviews");
                });

            modelBuilder.Entity("Models.Tenant", b =>
                {
                    b.Navigation("Users");
                });

            modelBuilder.Entity("Models.User", b =>
                {
                    b.Navigation("Account");
                });
#pragma warning restore 612, 618
        }
    }
}
