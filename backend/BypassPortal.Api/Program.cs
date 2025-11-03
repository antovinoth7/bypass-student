using System.Text;
using BypassPortal.Api.BackgroundJobs;
using BypassPortal.Api.Extensions;
using BypassPortal.Api.Infrastructure;
using BypassPortal.Api.Services;
using BypassPortal.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.ConfigureOptions(builder.Configuration);

builder.Services.AddDbContext<BypassDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<ILoginService, LoginService>();

builder.Services.AddHostedService<CleanupWorker>();

var jwtSettings = builder.Configuration.GetSection("Authentication:Jwt");
var signingKey = jwtSettings.GetValue<string>("SigningKey") ?? "changeme-signing-key";
var issuer = jwtSettings.GetValue<string>("Issuer") ?? "BypassPortal";
var audience = jwtSettings.GetValue<string>("Audience") ?? "BypassPortalClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
