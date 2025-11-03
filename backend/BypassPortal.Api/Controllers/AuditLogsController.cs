using BypassPortal.Api.Domain.Shared;
using BypassPortal.Api.DTOs;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BypassPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] AuditLogQuery query, CancellationToken cancellationToken)
    {
        var result = await _auditLogService.QueryAsync(query.Action, query.Success, query.Search, query.Page, query.PageSize, cancellationToken);
        var dto = new PagedResult<AuditLogDto>(
            result.Items.Select(x => new AuditLogDto(x.Id, x.TimestampUtc, x.Action, x.ActorUserId, x.Details, x.Success, x.MetadataJson)).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount);
        return Ok(dto);
    }
}
