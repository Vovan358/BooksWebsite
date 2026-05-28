using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Prometheus;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class BookController : ControllerBase
{
    private const string BooksCacheKey = "books_cache";

    private readonly AppDbContext _context;
    private readonly IDistributedCache _redis;

    public BookController(AppDbContext context, IDistributedCache redisCache)
    {
        _context = context;
        _redis = redisCache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        using (AppMetrics.GetBooksDuration.NewTimer())
        {
            AppMetrics.BooksRequestsCounter.Inc();

            var cached = await _redis.GetStringAsync(BooksCacheKey);
            if (cached != null)
            {
                var booksFromCache = JsonSerializer.Deserialize<List<BookResponseDto>>(cached);
                return Ok(booksFromCache);
            }

            var books = await BuildBooksQuery()
                .Where(b => !b.IsHidden)
                .ToListAsync();

            await _redis.SetStringAsync(
                BooksCacheKey,
                JsonSerializer.Serialize(books),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
                });

            await UpdateStockGauge();
            return Ok(books);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var book = await BuildBooksQuery()
            .FirstOrDefaultAsync(b => b.Id == id);

        return book == null ? NotFound() : Ok(book);
    }

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
                IsHidden = b.IsHidden,
                Price = b.Price,
                Stock = b.Stock,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                CreatedAt = b.CreatedAt,
                CommentsNumber = b.Comments.Count,
                AverageRating = b.Comments.Count == 0
                    ? 0
                    : b.Comments.Average(c => c.Rating),
                SoldCount = b.OrderItems.Sum(i => (int?)i.Quantity) ?? 0,
                FavoritesCount = b.FavoriteBooks.Count
            });
    }
}
