using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string sortBy = "booksBought",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        sortBy = NormalizeSortBy(sortBy);

        var users = await _context.Users
            .Select(u => new LeaderboardRowDto
            {
                UserId = u.Id,
                Username = u.Username,
                BooksBought = u.Orders.SelectMany(o => o.Items).Sum(i => (int?)i.Quantity) ?? 0,
                MoneySpent = u.Orders.Sum(o => (int?)o.TotalPrice) ?? 0,
                CommentsLeft = u.Comments.Count
            })
            .ToListAsync();

        var ordered = OrderRows(users, sortBy)
            .ThenBy(r => r.Username)
            .ToList();

        for (var i = 0; i < ordered.Count; i++)
            ordered[i].Rank = i + 1;

        var currentUserRanks = BuildCurrentUserRanks(users);

        var response = new LeaderboardResponseDto
        {
            SortBy = sortBy,
            Page = page,
            PageSize = pageSize,
            TotalUsers = ordered.Count,
            Rows = ordered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList(),
            CurrentUserRanks = currentUserRanks
        };

        return Ok(response);
    }

    private static string NormalizeSortBy(string sortBy)
    {
        return sortBy switch
        {
            "moneySpent" => "moneySpent",
            "commentsLeft" => "commentsLeft",
            _ => "booksBought"
        };
    }

    private static IOrderedEnumerable<LeaderboardRowDto> OrderRows(
        IEnumerable<LeaderboardRowDto> rows,
        string sortBy)
    {
        return sortBy switch
        {
            "moneySpent" => rows.OrderByDescending(r => r.MoneySpent),
            "commentsLeft" => rows.OrderByDescending(r => r.CommentsLeft),
            _ => rows.OrderByDescending(r => r.BooksBought)
        };
    }

    private UserLeaderboardRanksDto? BuildCurrentUserRanks(List<LeaderboardRowDto> rows)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
            return null;

        var user = rows.FirstOrDefault(r => r.UserId == userId);
        if (user == null)
            return null;

        return new UserLeaderboardRanksDto
        {
            UserId = user.UserId,
            Username = user.Username,
            BooksBoughtRank = GetRank(rows, userId, "booksBought"),
            MoneySpentRank = GetRank(rows, userId, "moneySpent"),
            CommentsLeftRank = GetRank(rows, userId, "commentsLeft")
        };
    }

    private static int GetRank(List<LeaderboardRowDto> rows, int userId, string sortBy)
    {
        var ordered = OrderRows(rows, sortBy)
            .ThenBy(r => r.Username)
            .ToList();

        return ordered.FindIndex(r => r.UserId == userId) + 1;
    }
}
