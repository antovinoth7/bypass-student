namespace BypassPortal.Api.DTOs;

public record StudentDto(
    Guid Id,
    string NusId,
    string? Name,
    string Reason,
    Guid AddedByUserId,
    DateTimeOffset AddedAtUtc,
    DateTimeOffset? ExpiresAtUtc,
    string Source,
    DateTimeOffset? RemovedAtUtc);

public record CreateStudentRequest(
    string NusId,
    string? Name,
    string Reason,
    DateTimeOffset? ExpiresAtUtc);

public record BatchStudentRequest(IEnumerable<CreateStudentRequest> Students);

public record RemoveStudentRequest(string? Reason);
