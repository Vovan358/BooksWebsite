using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private const string BooksCacheKey = "books_cache";

    private readonly AppDbContext _context;
    private readonly IDistributedCache _redis;

    public CommentController(AppDbContext context, IDistributedCache redis)
    {
        _context = context;
        _redis = redis;
    }

    [HttpGet("book/{bookId}")]
    public async Task<IActionResult> GetByBook(int bookId)
    {
        var comments = await _context.Comments
            .Where(c => c.BookId == bookId)
            .ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Post(Comment comment)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);

        if (!int.TryParse(userIdValue, out var userId) || string.IsNullOrEmpty(username))
            return Unauthorized("Invalid token");

        // 🔥 защита от фронта
        comment.Id = 0;
        comment.UserId = userId;
        comment.Author = username;

        // 🔥 ставим дату на сервере
        comment.CreatedAt = DateTime.UtcNow;

        if (comment.Rating < 0 || comment.Rating > 10)
            return BadRequest("Rating must be between 0 and 10");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return Ok(comment);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var comment = await _context.Comments.FindAsync(id);

        if (comment == null)
            return NotFound();

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized("Invalid token");

            if (comment.UserId != userId)
                return Forbid();
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return NoContent();
    }
}
