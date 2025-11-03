using BypassPortal.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BypassPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatusController : ControllerBase
{
    private readonly BypassDbContext _dbContext;

    public StatusController(BypassDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var activeBypasses = await _dbContext.StudentBypasses.CountAsync(cancellationToken);
        var auditCount = await _dbContext.AuditLogEntries.CountAsync(cancellationToken);
        var lastCleanup = await _dbContext.CleanupRuns.OrderByDescending(x => x.RunAtUtc).FirstOrDefaultAsync(cancellationToken);

        return Ok(new
        {
            activeBypasses,
            auditCount,
            lastCleanup = lastCleanup?.RunAtUtc
        });
    }
}
