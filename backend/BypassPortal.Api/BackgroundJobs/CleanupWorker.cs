using BypassPortal.Api.Domain.Options;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BypassPortal.Api.BackgroundJobs;

public class CleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CleanupWorker> _logger;
    private readonly CleanupOptions _options;

    public CleanupWorker(IServiceProvider serviceProvider, ILogger<CleanupWorker> logger, IOptions<CleanupOptions> options)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextRun();
            await Task.Delay(delay, stoppingToken);

            if (!_options.Enabled)
            {
                continue;
            }

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<BypassDbContext>();
            var settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
            var auditLogService = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

            try
            {
                var settings = await settingsService.GetAsync(stoppingToken);
                var cutoff = DateTimeOffset.UtcNow.AddHours(-settings.MaxBypassDurationHours);
                var expired = await dbContext.StudentBypasses.Where(x => x.ExpiresAtUtc <= cutoff).ToListAsync(stoppingToken);

                dbContext.StudentBypasses.RemoveRange(expired);
                await dbContext.SaveChangesAsync(stoppingToken);

                await settingsService.RegisterCleanupAsync("Scheduled", expired.Count, true, "Removed expired bypasses", stoppingToken);
                await auditLogService.LogAsync("CLEANUP_SUCCESS", null, $"Removed {expired.Count} entries", true, cancellationToken: stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute cleanup job");
                await auditLogService.LogAsync("CLEANUP_FAILED", null, ex.Message, false, cancellationToken: stoppingToken);
            }
        }
    }

    private TimeSpan GetDelayUntilNextRun()
    {
        var now = DateTimeOffset.UtcNow;
        var nextRun = new DateTimeOffset(now.Year, now.Month, now.Day, _options.RunHourUtc % 24, 0, 0, TimeSpan.Zero);
        if (nextRun <= now)
        {
            nextRun = nextRun.AddDays(1);
        }

        return nextRun - now;
    }
}
