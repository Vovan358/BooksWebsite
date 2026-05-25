using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Prometheus;
using StackExchange.Redis;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache; // 17
    private readonly IDistributedCache _redis; // 17
    private const string BooksCacheKey = "books_cache";
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
        using (AppMetrics.GetBooksDuration.NewTimer())
        {
            AppMetrics.BooksRequestsCounter.Inc(); //18
            var cached = await _redis.GetStringAsync(BooksCacheKey);

            if (cached != null)
            {
                Console.WriteLine("🔥 REDIS CACHE HIT");
                var booksFromCache = JsonSerializer.Deserialize<List<BookResponseDto>>(cached);
                return Ok(booksFromCache);
            }

            Console.WriteLine("❄ REDIS CACHE MISS");

            var books = await BuildBooksQuery()
                .ToListAsync();

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
        var book = await BuildBooksQuery()
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound();

        return Ok(book);
    }

    // ➕ POST создать книгу (для тестов)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        Console.WriteLine("🧹 Redis cache cleared after delete");
        return Ok(book);
    }

    [Authorize(Roles = "Admin")]
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
        AppMetrics.BooksInStockGauge.Set(totalStock);
    }

    private IQueryable<BookResponseDto> BuildBooksQuery()
    {
        return _context.Books
            .Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Available = b.Available,
                Price = b.Price,
                Stock = b.Stock,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                CommentsNumber = b.Comments.Count,
                AverageRating = b.Comments.Count == 0
                    ? 0
                    : b.Comments.Average(c => c.Rating)
            });
    }
}
