namespace BypassPortal.Api.Domain.Options;

public class JwtOptions
{
    public const string SectionName = "Authentication:Jwt";

    public string Issuer { get; init; } = "BypassPortal";
    public string Audience { get; init; } = "BypassPortalClients";
    public string SigningKey { get; init; } = "changeme-signing-key";
    public int TokenLifetimeMinutes { get; init; } = 60;
}
