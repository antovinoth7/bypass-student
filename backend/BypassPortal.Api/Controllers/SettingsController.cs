using BypassPortal.Api.DTOs;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BypassPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly IAuditLogService _auditLogService;

    public SettingsController(ISettingsService settingsService, IAuditLogService auditLogService)
    {
        _settingsService = settingsService;
        _auditLogService = auditLogService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetAsync(cancellationToken);
        var dto = new SystemSettingsDto(settings.AutoCleanupEnabled, settings.CleanupTimeUtc, settings.LogRetentionDays, settings.AllowBatchUpload, settings.GraphApiEndpoint, settings.SecurityGroupId, settings.MaxBypassDurationHours);
        return Ok(dto);
    }

    [HttpPut]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var settings = await _settingsService.UpdateAsync(request, userId, cancellationToken);
        await _auditLogService.LogAsync("UPDATE_SETTINGS", userId, "System settings updated", true, cancellationToken: cancellationToken);
        var dto = new SystemSettingsDto(settings.AutoCleanupEnabled, settings.CleanupTimeUtc, settings.LogRetentionDays, settings.AllowBatchUpload, settings.GraphApiEndpoint, settings.SecurityGroupId, settings.MaxBypassDurationHours);
        return Ok(dto);
    }

    [HttpPost("manual-cleanup")]
    [ProducesResponseType(typeof(CleanupResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ManualCleanup(CancellationToken cancellationToken)
    {
        // In a real implementation, this would trigger an async job.
        var run = await _settingsService.RegisterCleanupAsync("Manual", 0, true, "Manual cleanup triggered", cancellationToken);
        await _auditLogService.LogAsync("MANUAL_CLEANUP", GetUserId(), "Manual cleanup triggered", true, cancellationToken: cancellationToken);
        return Ok(new CleanupResultDto(run.RunAtUtc, run.Trigger, run.RemovedCount, run.Succeeded, run.Notes));
    }

    [HttpDelete("audit-logs")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> PurgeAuditLogs([FromQuery] int retentionDays = 30, CancellationToken cancellationToken = default)
    {
        await _settingsService.PurgeAuditLogsAsync(retentionDays, cancellationToken);
        await _auditLogService.LogAsync("PURGE_AUDIT_LOGS", GetUserId(), $"Purged logs older than {retentionDays} days", true, cancellationToken: cancellationToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var idClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier || c.Type == "sub");
        if (idClaim == null || !Guid.TryParse(idClaim.Value, out var id))
        {
            throw new InvalidOperationException("User identifier claim is missing");
        }

        return id;
    }
}
