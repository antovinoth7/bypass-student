namespace BypassPortal.Api.DTOs;

public record SystemSettingsDto(
    bool AutoCleanupEnabled,
    TimeSpan CleanupTimeUtc,
    int LogRetentionDays,
    bool AllowBatchUpload,
    string GraphApiEndpoint,
    string SecurityGroupId,
    int MaxBypassDurationHours);

public record UpdateSettingsRequest(
    bool AutoCleanupEnabled,
    TimeSpan CleanupTimeUtc,
    int LogRetentionDays,
    bool AllowBatchUpload,
    string GraphApiEndpoint,
    string SecurityGroupId,
    int MaxBypassDurationHours);

public record CleanupResultDto(DateTimeOffset RunAtUtc, string Trigger, int RemovedCount, bool Succeeded, string Notes);
