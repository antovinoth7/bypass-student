# Bypass Portal Backend

This folder contains the ASP.NET Core 8 Web API that mirrors the expectations of the React dashboard. It provides endpoints for authentication, student bypass management, audit log access, system configuration, and operational status.

## Projects

- `BypassPortal.Api` – Primary Web API project built with Entity Framework Core and JWT authentication.

## Running locally

1. Ensure .NET 8 SDK is installed.
2. Update the connection string in `appsettings.json` to point at your SQL Server (LocalDB works for development).
3. Provision the SQL Server schema using either the provided SQL script or EF Core migrations:
   - To run the hand-authored SQL script, execute `backend/DatabaseScripts/create_mssql_schema.sql` against your SQL Server instance (e.g. with `sqlcmd` or Azure Data Studio). This creates the `BypassPortal` database, tables, constraints, and useful defaults expected by the API.
   - To use EF Core migrations instead, scaffold and apply them:
     ```bash
     dotnet ef migrations add InitialCreate
     dotnet ef database update
     ```
4. Run the API:
   ```bash
   dotnet run --project backend/BypassPortal.Api
   ```

Swagger UI will be available at `https://localhost:5001/swagger` by default.
