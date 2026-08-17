namespace Dtos.Responses;

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = null!;

    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    public bool HasNext { get; set; }
    public bool HasPrevious { get; set; }

    // Takes already-mapped items, so it composes with the existing From(IEnumerable)
    // factories rather than replacing them. Named Of, not From — house convention is
    // From(entity) for entity to DTO, Of for construction from primitives.
    public static PagedResponse<T> Of (List<T> items, int page, int pageSize, int totalCount)
    {
        // Ceiling on double, not integer division: 25 rows at 10 a page is 3, not 2.
        // The pageSize guard is unreachable behind [Range] but this type is public.
        var totalPages = pageSize <= 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResponse<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasNext = page < totalPages,
            HasPrevious = page > 1 && totalCount > 0
        };
    }
}
