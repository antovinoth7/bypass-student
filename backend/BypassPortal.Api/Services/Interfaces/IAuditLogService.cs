using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.Domain.Shared;

namespace BypassPortal.Api.Services.Interfaces;

public interface IAuditLogService
{
    Task<AuditLogEntry> LogAsync(string action, Guid? actorUserId, string details, bool success, string? metadataJson = null, CancellationToken cancellationToken = default);
    Task<PagedResult<AuditLogEntry>> QueryAsync(string? action, bool? success, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
