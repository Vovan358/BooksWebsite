using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using StackExchange.Redis;
using System.Text.Json;
using Prometheus;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache; // 17
    private readonly IDistributedCache _redis; // 17
    private const string BooksCacheKey = "books_cache";

    private static readonly Counter BooksRequestsCounter =
    Metrics.CreateCounter("books_requests_total", "Total number of GET /books requests");

    private static readonly Counter OrdersCounter =
        Metrics.CreateCounter("orders_total", "Total number of orders placed");

    private static readonly Gauge BooksInStockGauge =
        Metrics.CreateGauge("books_stock_total", "Current total stock of all books");

    private static readonly Histogram GetBooksDuration =
        Metrics.CreateHistogram(
            "get_books_duration_seconds",
            "Time spent fetching books");
    public BookController(AppDbContext context, IMemoryCache cache, IDistributedCache redisCache)
    {
        _context = context;
        _cache = cache;
        _redis = redisCache;
    }

    // 📖 GET все книги
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        using (GetBooksDuration.NewTimer())
        {
            BooksRequestsCounter.Inc(); //18
            var cached = await _redis.GetStringAsync(BooksCacheKey);

            if (cached != null)
            {
                Console.WriteLine("🔥 REDIS CACHE HIT");
                var booksFromCache = JsonSerializer.Deserialize<List<Book>>(cached);
                return Ok(booksFromCache);
            }

            Console.WriteLine("❄ REDIS CACHE MISS");

            var books = await _context.Books.ToListAsync();

            var serialized = JsonSerializer.Serialize(books);

            await _redis.SetStringAsync(
                BooksCacheKey,
                serialized,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
                });

            await UpdateStockGauge();
            return Ok(books);
        }
        
    }

    // 📖 GET по id
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return NotFound();

        return Ok(book);
    }

    // ➕ POST создать книгу (для тестов)
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        Console.WriteLine("🧹 Redis cache cleared after delete");
        return Ok(book);
    }

    [Authorize]
    [HttpPost("order")]
    public async Task<IActionResult> PlaceOrder([FromBody] List<OrderItemDto> items)
    {
        OrdersCounter.Inc(); //18
        Console.WriteLine($"ORDER HIT: {items?.Count}");

        var bookIds = items.Select(i => i.BookId).ToList();

        var books = await _context.Books
            .Where(b => bookIds.Contains(b.Id))
            .ToListAsync();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        foreach (var item in items)
        {
            var book = books.FirstOrDefault(b => b.Id == item.BookId);
            if (book == null) continue;

            if (book.Stock >= item.Quantity)
            {
                book.Stock -= item.Quantity;

                if (book.Stock == 0)
                    book.Available = false;
            }
            else
            {
                return BadRequest($"Not enough stock for book {book.Id}");
            }
        }
        if (!ModelState.IsValid)
    return BadRequest(ModelState);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        Console.WriteLine("🧹 Redis cache cleared after order");
        await UpdateStockGauge();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        Console.WriteLine("🧹 Redis cache cleared after delete");
        await UpdateStockGauge();
        return NoContent();
    }

    // REDIS (17)
    [HttpGet("redis")]
    public async Task<IActionResult> GetAllRedis()
    {
        var cacheKey = "books_redis";

        var cachedData = await _redis.GetStringAsync(cacheKey);

        if (cachedData != null)
        {
            Console.WriteLine("⚡ REDIS CACHE HIT");

            var booksFromCache = JsonSerializer.Deserialize<List<Book>>(cachedData);
            return Ok(booksFromCache);
        }

        Console.WriteLine("📀 REDIS CACHE MISS");

        var books = await _context.Books.ToListAsync();

        var serialized = JsonSerializer.Serialize(books);

        var options = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

        await _redis.SetStringAsync(cacheKey, serialized, options);

        return Ok(books);
    }

    // 18
    private async Task UpdateStockGauge()
    {
        var totalStock = await _context.Books.SumAsync(b => b.Stock);
        BooksInStockGauge.Set(totalStock);
    }
}