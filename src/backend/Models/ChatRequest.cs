using System.ComponentModel.DataAnnotations;

public record Message(string Role, string Content);

public record ChatRequest(
    [Required]
    Message[] Messages,

    [Required]
    string To, // to model id.

    [Required]
    string From // from model id || user id.
);

public record ChatResponse(
    [Required]
    Message Message,

    [Required]
    int TokenUsed
);
