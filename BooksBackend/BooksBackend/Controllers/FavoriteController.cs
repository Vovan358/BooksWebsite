using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private const string BooksCacheKey = "books_cache";

    private readonly AppDbContext _context;
    private readonly IDistributedCache _redis;

    public FavoriteController(AppDbContext context, IDistributedCache redis)
    {
        _context = context;
        _redis = redis;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var books = await _context.FavoriteBooks
            .Where(f => f.UserId == userId.Value)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.Book!)
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
                CreatedAt = b.CreatedAt,
                CommentsNumber = b.Comments.Count,
                AverageRating = b.Comments.Count == 0
                    ? 0
                    : b.Comments.Average(c => c.Rating),
                SoldCount = b.OrderItems.Sum(i => (int?)i.Quantity) ?? 0,
                FavoritesCount = b.FavoriteBooks.Count
            })
            .ToListAsync();

        return Ok(books);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] FavoriteBookDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var bookExists = await _context.Books.AnyAsync(b => b.Id == dto.BookId);
        if (!bookExists)
            return NotFound();

        var exists = await _context.FavoriteBooks
            .AnyAsync(f => f.UserId == userId.Value && f.BookId == dto.BookId);

        if (!exists)
        {
            _context.FavoriteBooks.Add(new FavoriteBook
            {
                UserId = userId.Value,
                BookId = dto.BookId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await _redis.RemoveAsync(BooksCacheKey);
        }

        return Ok(new { dto.BookId });
    }

    [HttpDelete("{bookId}")]
    public async Task<IActionResult> Remove(int bookId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var favorite = await _context.FavoriteBooks
            .FirstOrDefaultAsync(f => f.UserId == userId.Value && f.BookId == bookId);

        if (favorite == null)
            return NoContent();

        _context.FavoriteBooks.Remove(favorite);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : null;
    }
}
