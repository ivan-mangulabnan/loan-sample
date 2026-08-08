using Models;

namespace Dtos.Responses;

public class FundReleaseResponse
{
    public int FundReleaseId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string? Remarks { get; set; }

    public string Status { get; set; } = null!;

    public static FundReleaseResponse From (FundRelease fundRelease) => new()
    {
        FundReleaseId = fundRelease.FundReleaseId,
        Amount = fundRelease.Amount,
        ReleaseDate = fundRelease.ReleaseDate,
        Remarks = fundRelease.Remarks,
        Status = fundRelease.Status.Label
    };

    public static List<FundReleaseResponse> From (IEnumerable<FundRelease> fundReleases) =>
        fundReleases.Select(From).ToList();
}
