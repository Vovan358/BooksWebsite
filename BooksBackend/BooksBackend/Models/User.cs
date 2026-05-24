using System.ComponentModel.DataAnnotations;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public List<Comment> Comments { get; set; } = new();

    public List<Order> Orders { get; set; } = new();
}
