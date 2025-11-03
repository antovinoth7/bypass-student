using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.DTOs;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BypassPortal.Api.Services;

public class SettingsService : ISettingsService
{
    private readonly BypassDbContext _dbContext;

    public SettingsService(BypassDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SystemSetting> GetAsync(CancellationToken cancellationToken = default)
    {
        var setting = await _dbContext.SystemSettings.SingleOrDefaultAsync(cancellationToken);
        if (setting is null)
        {
            setting = new SystemSetting
            {
                Id = Guid.NewGuid(),
                AutoCleanupEnabled = true,
                AllowBatchUpload = true,
                CleanupTimeUtc = TimeSpan.FromHours(1),
                LogRetentionDays = 30,
                MaxBypassDurationHours = 168,
                GraphApiEndpoint = "https://graph.microsoft.com/v1.0",
                SecurityGroupId = string.Empty,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
                UpdatedByUserId = Guid.Empty
            };

            await _dbContext.SystemSettings.AddAsync(setting, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return setting;
    }

    public async Task<SystemSetting> UpdateAsync(UpdateSettingsRequest request, Guid actorUserId, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var entity = await GetAsync(cancellationToken);
        entity.AutoCleanupEnabled = request.AutoCleanupEnabled;
        entity.CleanupTimeUtc = request.CleanupTimeUtc;
        entity.LogRetentionDays = request.LogRetentionDays;
        entity.AllowBatchUpload = request.AllowBatchUpload;
        entity.GraphApiEndpoint = request.GraphApiEndpoint;
        entity.SecurityGroupId = request.SecurityGroupId;
        entity.MaxBypassDurationHours = request.MaxBypassDurationHours;
        entity.UpdatedAtUtc = DateTimeOffset.UtcNow;
        entity.UpdatedByUserId = actorUserId;

        _dbContext.SystemSettings.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<CleanupRun> RegisterCleanupAsync(string trigger, int removedCount, bool succeeded, string notes, CancellationToken cancellationToken = default)
    {
        var run = new CleanupRun
        {
            Id = Guid.NewGuid(),
            RunAtUtc = DateTimeOffset.UtcNow,
            Trigger = trigger,
            RemovedCount = removedCount,
            Succeeded = succeeded,
            Notes = notes
        };

        await _dbContext.CleanupRuns.AddAsync(run, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return run;
    }

    public async Task PurgeAuditLogsAsync(int retentionDays, CancellationToken cancellationToken = default)
    {
        if (retentionDays <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(retentionDays), "Retention period must be positive");
        }

        var cutoff = DateTimeOffset.UtcNow.AddDays(-retentionDays);
        var oldEntries = await _dbContext.AuditLogEntries.Where(x => x.TimestampUtc < cutoff).ToListAsync(cancellationToken);
        _dbContext.AuditLogEntries.RemoveRange(oldEntries);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
