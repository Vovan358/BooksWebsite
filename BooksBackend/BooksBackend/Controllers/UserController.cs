using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me/stats")]
    public async Task<IActionResult> GetMyStats()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var stats = await _context.Users
            .Where(u => u.Id == userId.Value)
            .Select(u => new UserStatsDto
            {
                UserId = u.Id,
                Username = u.Username,
                OrdersCount = u.Orders.Count,
                BooksBought = u.Orders.SelectMany(o => o.Items).Sum(i => (int?)i.Quantity) ?? 0,
                MoneySpent = u.Orders.Sum(o => (int?)o.TotalPrice) ?? 0,
                CommentsLeft = u.Comments.Count
            })
            .FirstOrDefaultAsync();

        if (stats == null)
            return NotFound();

        return Ok(stats);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : null;
    }
}
