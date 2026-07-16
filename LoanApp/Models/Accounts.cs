namespace Models;

public class Accounts
{
    public int AccountId { get; set; }
    public int UserId { get; set; }
    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
    public DateTime Birthdate { get; set; }
}