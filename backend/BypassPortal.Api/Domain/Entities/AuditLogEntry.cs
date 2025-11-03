namespace BypassPortal.Api.Domain.Entities;

public class AuditLogEntry
{
    public Guid Id { get; set; }
    public DateTimeOffset TimestampUtc { get; set; }
    public string Action { get; set; } = null!;
    public Guid? ActorUserId { get; set; }
    public StaffUser? ActorUser { get; set; }
    public string Details { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? MetadataJson { get; set; }
}
