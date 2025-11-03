using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.DTOs;

namespace BypassPortal.Api.Services.Interfaces;

public interface ILoginService
{
    Task<(StaffUser User, string Token)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
