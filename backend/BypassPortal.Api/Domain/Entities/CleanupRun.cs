namespace BypassPortal.Api.Domain.Entities;

public class CleanupRun
{
    public Guid Id { get; set; }
    public DateTimeOffset RunAtUtc { get; set; }
    public string Trigger { get; set; } = "Manual";
    public int RemovedCount { get; set; }
    public bool Succeeded { get; set; }
    public string Notes { get; set; } = string.Empty;
}
