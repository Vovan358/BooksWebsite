public class CommentResponseDto
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public int? UserId { get; set; }

    public string Author { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public int Rating { get; set; }

    public DateTime CreatedAt { get; set; }

    public int Score { get; set; }

    public int MyVote { get; set; }

    public bool IsReportedByMe { get; set; }

    public int ReportsCount { get; set; }
}
