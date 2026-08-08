namespace Dtos.Responses;

public class MessageResponse
{
    public string Message { get; set; } = null!;

    public static MessageResponse Of (string message) => new() { Message = message };
}