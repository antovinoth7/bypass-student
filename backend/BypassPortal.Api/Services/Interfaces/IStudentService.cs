using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.Domain.Shared;
using BypassPortal.Api.DTOs;

namespace BypassPortal.Api.Services.Interfaces;

public interface IStudentService
{
    Task<StudentBypass> AddAsync(CreateStudentRequest request, Guid actorUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StudentBypass>> BatchAddAsync(IEnumerable<CreateStudentRequest> requests, Guid actorUserId, CancellationToken cancellationToken = default);
    Task<bool> RemoveAsync(Guid id, Guid actorUserId, string? reason, CancellationToken cancellationToken = default);
    Task<PagedResult<StudentBypass>> QueryAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
