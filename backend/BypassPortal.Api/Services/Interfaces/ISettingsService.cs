using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.DTOs;

namespace BypassPortal.Api.Services.Interfaces;

public interface ISettingsService
{
    Task<SystemSetting> GetAsync(CancellationToken cancellationToken = default);
    Task<SystemSetting> UpdateAsync(UpdateSettingsRequest request, Guid actorUserId, CancellationToken cancellationToken = default);
    Task<CleanupRun> RegisterCleanupAsync(string trigger, int removedCount, bool succeeded, string notes, CancellationToken cancellationToken = default);
    Task PurgeAuditLogsAsync(int retentionDays, CancellationToken cancellationToken = default);
}
