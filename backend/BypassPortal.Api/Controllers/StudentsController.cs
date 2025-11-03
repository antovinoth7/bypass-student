using BypassPortal.Api.Domain.Shared;
using BypassPortal.Api.DTOs;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BypassPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<StudentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStudents([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
    {
        var result = await _studentService.QueryAsync(search, page, pageSize, cancellationToken);
        var dto = new PagedResult<StudentDto>(
            result.Items.Select(MapToDto).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount);
        return Ok(dto);
    }

    [HttpPost]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddStudent([FromBody] CreateStudentRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var student = await _studentService.AddAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetStudents), new { id = student.Id }, MapToDto(student));
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(IReadOnlyCollection<StudentDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Batch([FromBody] BatchStudentRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var students = await _studentService.BatchAddAsync(request.Students, userId, cancellationToken);
        var dtos = students.Select(MapToDto).ToList();
        return StatusCode(StatusCodes.Status201Created, dtos);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Remove(Guid id, [FromBody] RemoveStudentRequest? request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var removed = await _studentService.RemoveAsync(id, userId, request?.Reason, cancellationToken);
        if (!removed)
        {
            return NotFound();
        }

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

    private static StudentDto MapToDto(Domain.Entities.StudentBypass student)
        => new(student.Id, student.NusId, student.Name, student.Reason, student.AddedByUserId, student.AddedAtUtc, student.ExpiresAtUtc, student.Source, student.RemovedAtUtc);
}
