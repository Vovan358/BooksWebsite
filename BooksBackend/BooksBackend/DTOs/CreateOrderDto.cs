public class CreateOrderDto
{
    public List<OrderItemDto> Items { get; set; } = new();

    public string DeliveryAddress { get; set; } = string.Empty;
}
