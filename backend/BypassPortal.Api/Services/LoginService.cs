using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BypassPortal.Api.Domain.Entities;
using BypassPortal.Api.Domain.Options;
using BypassPortal.Api.DTOs;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BypassPortal.Api.Services;

public class LoginService : ILoginService
{
    private readonly BypassDbContext _dbContext;
    private readonly JwtOptions _jwtOptions;

    public LoginService(BypassDbContext dbContext, IOptions<JwtOptions> jwtOptions)
    {
        _dbContext = dbContext;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<(StaffUser User, string Token)> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var user = await _dbContext.StaffUsers.FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);
        if (user is null)
        {
            user = new StaffUser
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                DisplayName = request.DisplayName,
                Department = request.Department,
                Role = request.Role,
                LastLoginUtc = DateTimeOffset.UtcNow
            };

            await _dbContext.StaffUsers.AddAsync(user, cancellationToken);
        }
        else
        {
            user.DisplayName = request.DisplayName;
            user.Department = request.Department;
            user.Role = request.Role;
            user.LastLoginUtc = DateTimeOffset.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtOptions.SigningKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.TokenLifetimeMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return (user, tokenString);
    }
}
