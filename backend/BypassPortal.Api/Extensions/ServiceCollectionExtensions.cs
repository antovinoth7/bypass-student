using BypassPortal.Api.Domain.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BypassPortal.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection ConfigureOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<GraphOptions>(configuration.GetSection(GraphOptions.SectionName));
        services.Configure<CleanupOptions>(configuration.GetSection(CleanupOptions.SectionName));
        return services;
    }
}
