using System.Text.Json.Serialization;

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int BookId { get; set; }

    public int Quantity { get; set; }

    public int PriceAtMoment { get; set; }

    [JsonIgnore]
    public Order? Order { get; set; }

    public Book? Book { get; set; }
}
