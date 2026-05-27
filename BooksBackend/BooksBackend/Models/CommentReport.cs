public class CommentReport
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CommentId { get; set; }

    public string Status { get; set; } = "Open";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }

    public Comment? Comment { get; set; }
}
