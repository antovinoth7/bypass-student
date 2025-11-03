namespace BypassPortal.Api.Domain.Shared;

public record PagedResult<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int TotalCount);
