using BypassPortal.Api.DTOs;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BypassPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ILoginService _loginService;

    public AuthController(ILoginService loginService)
    {
        _loginService = loginService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var (user, token) = await _loginService.LoginAsync(request, cancellationToken);
        var response = new LoginResponse(token, user.Id, user.Email, user.DisplayName, user.Role, user.Department, user.LastLoginUtc);
        return Ok(response);
    }
}
