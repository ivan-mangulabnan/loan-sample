namespace Services;

/// <summary>
/// The ceiling on every list endpoint.
///
/// Lists are returned whole — filtered in SQL, then paged in the browser against the
/// height of the reader's screen — so this is the only thing between a stray query and
/// a response the size of the table. It is not a page size: nobody asks for the second
/// thousand, because there is no second request.
///
/// Deliberately silent. A tenancy that grows past this shows the first 1000 rows and
/// says nothing about the rest, which is a trade this project makes knowingly: its
/// largest table is two figures. The day that stops being true, the fix is a total on
/// the response — not the return of paging.
/// </summary>
internal static class ListLimit
{
    public const int MaxRows = 1000;
}
