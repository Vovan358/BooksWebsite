using System.Text.Json.Serialization;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public DateTime Date { get; set; }

    public int TotalPrice { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}
