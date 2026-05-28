public class OrderResponseDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public DateTime Date { get; set; }

    public int TotalPrice { get; set; }

    public string DeliveryAddress { get; set; } = string.Empty;

    public List<OrderHistoryItemDto> Items { get; set; } = new();
}

public class OrderHistoryItemDto
{
    public int BookId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int PriceAtMoment { get; set; }
}
