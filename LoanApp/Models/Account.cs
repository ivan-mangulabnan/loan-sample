namespace Models;

public class Account
{
    public int AccountId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
    public DateTime Birthdate { get; set; }
}