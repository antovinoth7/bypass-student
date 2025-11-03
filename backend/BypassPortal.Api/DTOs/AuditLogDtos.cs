namespace BypassPortal.Api.DTOs;

public record AuditLogDto(
    Guid Id,
    DateTimeOffset TimestampUtc,
    string Action,
    Guid? ActorUserId,
    string Details,
    bool Success,
    string? MetadataJson);

public record AuditLogQuery(string? Action, bool? Success, string? Search, int Page = 1, int PageSize = 25);
