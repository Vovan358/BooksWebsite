using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentController(AppDbContext context)
    {
        _context = context;
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
        // 🔥 защита от фронта
        comment.Id = 0;

        // 🔥 ставим дату на сервере
        comment.CreatedAt = DateTime.UtcNow;

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var comment = await _context.Comments.FindAsync(id);

        if (comment == null)
            return NotFound();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}