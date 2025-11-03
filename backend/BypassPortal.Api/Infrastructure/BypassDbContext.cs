using BypassPortal.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BypassPortal.Api.Infrastructure;

public class BypassDbContext : DbContext
{
    public BypassDbContext(DbContextOptions<BypassDbContext> options) : base(options)
    {
    }

    public DbSet<StaffUser> StaffUsers => Set<StaffUser>();
    public DbSet<StudentBypass> StudentBypasses => Set<StudentBypass>();
    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<CleanupRun> CleanupRuns => Set<CleanupRun>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<StudentBypass>(entity =>
        {
            entity.HasIndex(e => e.NusId).IsUnique();
            entity.Property(e => e.NusId).HasMaxLength(16);
            entity.Property(e => e.Source).HasMaxLength(16);
            entity.Property(e => e.Reason).HasMaxLength(512);
        });

        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.Property(e => e.Action).HasMaxLength(64);
            entity.Property(e => e.Details).HasMaxLength(1024);
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.Property(e => e.GraphApiEndpoint).HasMaxLength(256);
            entity.Property(e => e.SecurityGroupId).HasMaxLength(128);
            entity.Property(e => e.AllowBatchUpload).HasDefaultValue(true);
            entity.Property(e => e.AutoCleanupEnabled).HasDefaultValue(true);
            entity.HasIndex(e => e.SecurityGroupId);
        });

        modelBuilder.Entity<StaffUser>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.Role).HasMaxLength(32);
            entity.Property(e => e.Department).HasMaxLength(128);
        });

        modelBuilder.Entity<CleanupRun>(entity =>
        {
            entity.Property(e => e.Trigger).HasMaxLength(16);
        });
    }
}
