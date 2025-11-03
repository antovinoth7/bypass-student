using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.Domain.Shared;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BypassPortal.Api.Services;

public class AuditLogService : IAuditLogService
{
    private readonly BypassDbContext _dbContext;

    public AuditLogService(BypassDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AuditLogEntry> LogAsync(string action, Guid? actorUserId, string details, bool success, string? metadataJson = null, CancellationToken cancellationToken = default)
    {
        var entry = new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            Action = action,
            ActorUserId = actorUserId,
            Details = details,
            Success = success,
            MetadataJson = metadataJson,
            TimestampUtc = DateTimeOffset.UtcNow
        };

        await _dbContext.AuditLogEntries.AddAsync(entry, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entry;
    }

    public async Task<PagedResult<AuditLogEntry>> QueryAsync(string? action, bool? success, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        if (page <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(page));
        }

        if (pageSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(pageSize));
        }

        var query = _dbContext.AuditLogEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(x => x.Action == action);
        }

        if (success.HasValue)
        {
            query = query.Where(x => x.Success == success.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Details.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogEntry>(items, page, pageSize, totalCount);
    }
}
