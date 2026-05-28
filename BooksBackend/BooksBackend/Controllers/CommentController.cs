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
        var currentUserId = GetCurrentUserId();

        var comments = await _context.Comments
            .Where(c => c.BookId == bookId)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                BookId = c.BookId,
                UserId = c.UserId,
                Author = c.Author,
                Text = c.Text,
                Rating = c.Rating,
                CreatedAt = c.CreatedAt,
                Score = c.Votes.Sum(v => (int?)v.Value) ?? 0,
                MyVote = currentUserId == null
                    ? 0
                    : c.Votes
                        .Where(v => v.UserId == currentUserId.Value)
                        .Select(v => (int?)v.Value)
                        .FirstOrDefault() ?? 0,
                IsReportedByMe = currentUserId != null &&
                    c.Reports.Any(r => r.UserId == currentUserId.Value),
                ReportsCount = c.Reports.Count
            })
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

        if (comment.Text.Length > 1000)
            return BadRequest("Comment text cannot be longer than 1000 characters");

        var alreadyCommented = await _context.Comments
            .AnyAsync(c => c.BookId == comment.BookId && c.UserId == userId);

        if (alreadyCommented)
            return BadRequest("You already left a review for this book");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return Ok(await BuildCommentResponse(comment.Id));
    }

    [Authorize]
    [HttpPost("{id}/vote")]
    public async Task<IActionResult> Vote(int id, [FromBody] CommentVoteDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        if (dto.Value != 1 && dto.Value != -1)
            return BadRequest("Vote value must be 1 or -1");

        var commentExists = await _context.Comments.AnyAsync(c => c.Id == id);
        if (!commentExists)
            return NotFound();

        var vote = await _context.CommentVotes
            .FirstOrDefaultAsync(v => v.CommentId == id && v.UserId == userId.Value);

        if (vote == null)
        {
            vote = new CommentVote
            {
                CommentId = id,
                UserId = userId.Value,
                Value = dto.Value,
                CreatedAt = DateTime.UtcNow
            };
            _context.CommentVotes.Add(vote);
        }
        else if (vote.Value == dto.Value)
        {
            _context.CommentVotes.Remove(vote);
        }
        else
        {
            vote.Value = dto.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(await BuildCommentResponse(id));
    }

    [Authorize]
    [HttpPost("{id}/report")]
    public async Task<IActionResult> Report(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var commentExists = await _context.Comments.AnyAsync(c => c.Id == id);
        if (!commentExists)
            return NotFound();

        var reportExists = await _context.CommentReports
            .AnyAsync(r => r.CommentId == id && r.UserId == userId.Value);

        if (!reportExists)
        {
            _context.CommentReports.Add(new CommentReport
            {
                CommentId = id,
                UserId = userId.Value,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        return Ok(await BuildCommentResponse(id));
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

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : null;
    }

    private async Task<CommentResponseDto> BuildCommentResponse(int commentId)
    {
        var currentUserId = GetCurrentUserId();

        return await _context.Comments
            .Where(c => c.Id == commentId)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                BookId = c.BookId,
                UserId = c.UserId,
                Author = c.Author,
                Text = c.Text,
                Rating = c.Rating,
                CreatedAt = c.CreatedAt,
                Score = c.Votes.Sum(v => (int?)v.Value) ?? 0,
                MyVote = currentUserId == null
                    ? 0
                    : c.Votes
                        .Where(v => v.UserId == currentUserId.Value)
                        .Select(v => (int?)v.Value)
                        .FirstOrDefault() ?? 0,
                IsReportedByMe = currentUserId != null &&
                    c.Reports.Any(r => r.UserId == currentUserId.Value),
                ReportsCount = c.Reports.Count
            })
            .FirstAsync();
    }
}
