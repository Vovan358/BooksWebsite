using System.ComponentModel.DataAnnotations;

public class Book
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    public string Author { get; set; }

    public bool Available { get; set; }

    public int Price { get; set; }

    public int Stock { get; set; }

    // Связь с комментариями
    public List<Comment> Comments { get; set; } = new();
    public string ImageUrl { get; set; } = "";
}