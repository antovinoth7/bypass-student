namespace BypassPortal.Api.Domain.Options;

public class GraphOptions
{
    public const string SectionName = "MicrosoftGraph";

    public string TenantId { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string ClientSecret { get; init; } = string.Empty;
    public string SecurityGroupId { get; init; } = string.Empty;
}
