namespace BypassPortal.Api.Domain.Entities;

public class StaffUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = "invigilator";
    public string Department { get; set; } = string.Empty;
    public DateTimeOffset LastLoginUtc { get; set; }
    public ICollection<StudentBypass> CreatedBypasses { get; set; } = new HashSet<StudentBypass>();
    public ICollection<AuditLogEntry> AuditLogs { get; set; } = new HashSet<AuditLogEntry>();
}
