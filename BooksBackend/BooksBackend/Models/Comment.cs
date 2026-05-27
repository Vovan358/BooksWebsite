using System.Text.Json.Serialization;

public class Comment
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public int? UserId { get; set; }

    public string Author { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public int Rating { get; set; }

    public DateTime CreatedAt { get; set; }

    [JsonIgnore] // 🔥 важно
    public Book? Book { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    public List<CommentVote> Votes { get; set; } = new();

    public List<CommentReport> Reports { get; set; } = new();
}
