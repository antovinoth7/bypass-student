namespace BypassPortal.Api.Domain.Options;

public class CleanupOptions
{
    public const string SectionName = "Cleanup";

    public bool Enabled { get; init; } = true;
    public int RunHourUtc { get; init; } = 1;
}
