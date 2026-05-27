using System.ComponentModel.DataAnnotations;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProfile? Profile { get; set; }

    public List<Comment> Comments { get; set; } = new();

    public List<Order> Orders { get; set; } = new();

    public List<FavoriteBook> FavoriteBooks { get; set; } = new();

    public List<CommentVote> CommentVotes { get; set; } = new();

    public List<CommentReport> CommentReports { get; set; } = new();
}
