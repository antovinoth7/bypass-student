namespace BypassPortal.Api.DTOs;

public record LoginRequest(string Email, string DisplayName, string Department, string Role);

public record LoginResponse(string Token, Guid UserId, string Email, string DisplayName, string Role, string Department, DateTimeOffset LastLoginUtc);
