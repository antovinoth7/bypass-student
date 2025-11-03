using System.Text.RegularExpressions;
using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.Domain.Shared;
using BypassPortal.Api.DTOs;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BypassPortal.Api.Services;

public class StudentService : IStudentService
{
    private static readonly Regex NusIdRegex = new("^[AU][0-9]{7}[A-Z]$", RegexOptions.Compiled);
    private readonly BypassDbContext _dbContext;
    private readonly IAuditLogService _auditLogService;

    public StudentService(BypassDbContext dbContext, IAuditLogService auditLogService)
    {
        _dbContext = dbContext;
        _auditLogService = auditLogService;
    }

    public async Task<StudentBypass> AddAsync(CreateStudentRequest request, Guid actorUserId, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        ValidateRequest(request);

        if (await _dbContext.StudentBypasses.AnyAsync(x => x.NusId == request.NusId, cancellationToken))
        {
            throw new InvalidOperationException($"Student with NUS ID {request.NusId} already exists.");
        }

        var entity = new StudentBypass
        {
            Id = Guid.NewGuid(),
            NusId = request.NusId,
            Name = request.Name,
            Reason = request.Reason,
            AddedAtUtc = DateTimeOffset.UtcNow,
            AddedByUserId = actorUserId,
            ExpiresAtUtc = request.ExpiresAtUtc,
            Source = "Manual"
        };

        await _dbContext.StudentBypasses.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync("ADD_STUDENT", actorUserId, $"Added {entity.NusId}", true, cancellationToken: cancellationToken);
        return entity;
    }

    public async Task<IReadOnlyCollection<StudentBypass>> BatchAddAsync(IEnumerable<CreateStudentRequest> requests, Guid actorUserId, CancellationToken cancellationToken = default)
    {
        if (requests is null)
        {
            throw new ArgumentNullException(nameof(requests));
        }

        var items = requests.ToList();
        if (items.Count == 0)
        {
            return Array.Empty<StudentBypass>();
        }
        foreach (var request in items)
        {
            ValidateRequest(request);
        }

        var nusIds = items.Select(x => x.NusId).ToList();
        var existingIds = await _dbContext.StudentBypasses.Where(x => nusIds.Contains(x.NusId)).Select(x => x.NusId).ToListAsync(cancellationToken);
        if (existingIds.Any())
        {
            throw new InvalidOperationException($"The following NUS IDs already exist: {string.Join(", ", existingIds)}");
        }

        var now = DateTimeOffset.UtcNow;
        var entities = items.Select(request => new StudentBypass
        {
            Id = Guid.NewGuid(),
            NusId = request.NusId,
            Name = request.Name,
            Reason = request.Reason,
            AddedAtUtc = now,
            AddedByUserId = actorUserId,
            ExpiresAtUtc = request.ExpiresAtUtc,
            Source = "Batch"
        }).ToList();

        await _dbContext.StudentBypasses.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync("BATCH_UPLOAD", actorUserId, $"Uploaded {entities.Count} student bypasses", true, cancellationToken: cancellationToken);
        return entities;
    }

    public async Task<bool> RemoveAsync(Guid id, Guid actorUserId, string? reason, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.StudentBypasses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.StudentBypasses.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync("REMOVE_STUDENT", actorUserId, $"Removed {entity.NusId} ({reason})", true, cancellationToken: cancellationToken);
        return true;
    }

    public async Task<PagedResult<StudentBypass>> QueryAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        if (page <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(page));
        }

        if (pageSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(pageSize));
        }

        var query = _dbContext.StudentBypasses.Include(x => x.AddedByUser).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.NusId.Contains(search) || (x.Name != null && x.Name.Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.AddedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<StudentBypass>(items, page, pageSize, totalCount);
    }

    private static void ValidateRequest(CreateStudentRequest request)
    {
        if (!NusIdRegex.IsMatch(request.NusId))
        {
            throw new ArgumentException($"NUS ID {request.NusId} is invalid", nameof(request.NusId));
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new ArgumentException("Reason is required", nameof(request.Reason));
        }
    }
}
