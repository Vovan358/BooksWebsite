using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private const string BooksCacheKey = "books_cache";

    private readonly AppDbContext _context;
    private readonly IDistributedCache _redis;

    public OrderController(AppDbContext context, IDistributedCache redis)
    {
        _context = context;
        _redis = redis;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        if (dto == null || dto.Items == null)
            return BadRequest("Order is empty");

        if (dto.Items.Count == 0)
            return BadRequest("Order is empty");

        var groupedItems = dto.Items
            .Where(i => i.Quantity > 0)
            .GroupBy(i => i.BookId)
            .Select(g => new OrderItemDto
            {
                BookId = g.Key,
                Quantity = g.Sum(i => i.Quantity)
            })
            .ToList();

        if (groupedItems.Count == 0)
            return BadRequest("Order items must have positive quantity");

        var bookIds = groupedItems.Select(i => i.BookId).ToList();

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var books = await _context.Books
            .Where(b => bookIds.Contains(b.Id))
            .ToListAsync();

        if (books.Count != bookIds.Count)
            return BadRequest("Some books were not found");

        var order = new Order
        {
            UserId = userId.Value,
            Date = DateTime.UtcNow
        };

        foreach (var item in groupedItems)
        {
            var book = books.First(b => b.Id == item.BookId);

            if (book.Stock < item.Quantity)
                return BadRequest($"Not enough stock for book {book.Id}");

            book.Stock -= item.Quantity;
            book.Available = book.Stock > 0;

            order.Items.Add(new OrderItem
            {
                BookId = book.Id,
                Quantity = item.Quantity,
                PriceAtMoment = book.Price
            });
        }

        order.TotalPrice = order.Items.Sum(i => i.Quantity * i.PriceAtMoment);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        AppMetrics.OrdersCounter.Inc();
        await _redis.RemoveAsync(BooksCacheKey);
        await UpdateStockGauge();

        return Ok(await BuildOrderResponse(order.Id));
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var orders = await _context.Orders
            .Where(o => o.UserId == userId.Value)
            .OrderByDescending(o => o.Date)
            .Select(o => new OrderResponseDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Date = o.Date,
                TotalPrice = o.TotalPrice,
                Items = o.Items.Select(i => new OrderHistoryItemDto
                {
                    BookId = i.BookId,
                    Title = i.Book != null ? i.Book.Title : "",
                    Author = i.Book != null ? i.Book.Author : "",
                    ImageUrl = i.Book != null ? i.Book.ImageUrl : "",
                    Quantity = i.Quantity,
                    PriceAtMoment = i.PriceAtMoment
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : null;
    }

    private async Task<OrderResponseDto> BuildOrderResponse(int orderId)
    {
        return await _context.Orders
            .Where(o => o.Id == orderId)
            .Select(o => new OrderResponseDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Date = o.Date,
                TotalPrice = o.TotalPrice,
                Items = o.Items.Select(i => new OrderHistoryItemDto
                {
                    BookId = i.BookId,
                    Title = i.Book != null ? i.Book.Title : "",
                    Author = i.Book != null ? i.Book.Author : "",
                    ImageUrl = i.Book != null ? i.Book.ImageUrl : "",
                    Quantity = i.Quantity,
                    PriceAtMoment = i.PriceAtMoment
                }).ToList()
            })
            .FirstAsync();
    }

    private async Task UpdateStockGauge()
    {
        var totalStock = await _context.Books.SumAsync(b => b.Stock);
        AppMetrics.BooksInStockGauge.Set(totalStock);
    }
}
