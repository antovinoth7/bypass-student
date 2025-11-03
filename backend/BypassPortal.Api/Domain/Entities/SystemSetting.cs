namespace BypassPortal.Api.Domain.Entities;

public class SystemSetting
{
    public Guid Id { get; set; }
    public bool AutoCleanupEnabled { get; set; }
    public TimeSpan CleanupTimeUtc { get; set; }
    public int LogRetentionDays { get; set; }
    public bool AllowBatchUpload { get; set; }
    public string GraphApiEndpoint { get; set; } = string.Empty;
    public string SecurityGroupId { get; set; } = string.Empty;
    public int MaxBypassDurationHours { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public Guid UpdatedByUserId { get; set; }
}
