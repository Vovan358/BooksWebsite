public class BookResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public bool Available { get; set; }

    public int Price { get; set; }

    public int Stock { get; set; }

    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int CommentsNumber { get; set; }

    public double AverageRating { get; set; }

    public int SoldCount { get; set; }

    public int FavoritesCount { get; set; }
}
