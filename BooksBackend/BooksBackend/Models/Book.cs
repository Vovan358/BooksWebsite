using System.ComponentModel.DataAnnotations;

public class Book
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public bool Available { get; set; }

    public int Price { get; set; }

    public int Stock { get; set; }

    public string Description { get; set; } = "";

    public string ImageUrl { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Связь с комментариями
    public List<Comment> Comments { get; set; } = new();

    public List<OrderItem> OrderItems { get; set; } = new();

    public List<FavoriteBook> FavoriteBooks { get; set; } = new();
}
