# Bypass Portal Backend

This folder contains the ASP.NET Core 8 Web API that mirrors the expectations of the React dashboard. It provides endpoints for authentication, student bypass management, audit log access, system configuration, and operational status.

## Projects

- `BypassPortal.Api` – Primary Web API project built with Entity Framework Core and JWT authentication.

## Running locally

1. Ensure .NET 8 SDK is installed.
2. Update the connection string in `appsettings.json` to point at your SQL Server (LocalDB works for development).
3. Apply EF Core migrations (none are included yet):
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run --project backend/BypassPortal.Api
   ```

Swagger UI will be available at `https://localhost:5001/swagger` by default.
