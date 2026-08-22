namespace Dtos.Requests;

public class LedgerQueryRequest
{
  // Null means "do not filter". Deliberately no tenantId — that comes from the signed
  // token and must not be spoofable from the query string.

  // Matched against ReferenceId, and only when the term parses as an int. A transaction
  // carries no text to search: no borrower, no remarks. See GetTransactionsAsync for why
  // a non-numeric term matches nothing rather than being ignored.
  public string? Search { get; set; }

  // The transaction type CODE — "FUND_RELEASE", not the "Fund Release" label. Sending
  // the label matches nothing and looks like a working filter over no data.
  public string? Type { get; set; }
}
