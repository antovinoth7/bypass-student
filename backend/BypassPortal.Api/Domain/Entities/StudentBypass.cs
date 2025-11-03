namespace BypassPortal.Api.Domain.Entities;

public class StudentBypass
{
    public Guid Id { get; set; }
    public string NusId { get; set; } = null!;
    public string? Name { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid AddedByUserId { get; set; }
    public StaffUser? AddedByUser { get; set; }
    public DateTimeOffset AddedAtUtc { get; set; }
    public DateTimeOffset? ExpiresAtUtc { get; set; }
    public string Source { get; set; } = "Manual";
    public DateTimeOffset? RemovedAtUtc { get; set; }
}
