using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("me/profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        var profile = await EnsureProfile(userId.Value);
        return Ok(await BuildProfileDto(
            userId.Value,
            includePrivateData: true,
            includeHiddenBlocks: true));
    }

    [Authorize]
    [HttpPut("me/profile")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized("Invalid token");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var profile = await EnsureProfile(userId.Value);

        profile.AvatarUrl = dto.AvatarUrl;
        profile.Description = dto.Description;
        profile.Email = dto.Email;
        profile.Country = dto.Country;
        profile.City = dto.City;
        profile.Street = dto.Street;
        profile.House = dto.House;
        profile.Apartment = dto.Apartment;
        profile.PickupPoint = dto.PickupPoint;
        profile.ShowFavorites = dto.ShowFavorites;
        profile.ShowOrderHistory = dto.ShowOrderHistory;
        profile.ShowStats = dto.ShowStats;

        await _context.SaveChangesAsync();

        return Ok(await BuildProfileDto(
            userId.Value,
            includePrivateData: true,
            includeHiddenBlocks: true));
    }

    [AllowAnonymous]
    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetPublicProfile(int id)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == id);
        if (!exists)
            return NotFound();

        var currentUserId = GetCurrentUserId();
        var includeHiddenBlocks =
            currentUserId == id || User.IsInRole("Admin");

        return Ok(await BuildProfileDto(
            id,
            includePrivateData: false,
            includeHiddenBlocks: includeHiddenBlocks));
    }

    [Authorize]
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

    private async Task<UserProfile> EnsureProfile(int userId)
    {
        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile != null)
            return profile;

        profile = new UserProfile { UserId = userId };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        return profile;
    }

    private async Task<UserProfileDto?> BuildProfileDto(
        int userId,
        bool includePrivateData,
        bool includeHiddenBlocks)
    {
        var dto = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto
            {
                UserId = u.Id,
                Username = u.Username,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
                AvatarUrl = u.Profile == null ? "" : u.Profile.AvatarUrl,
                Description = u.Profile == null ? "" : u.Profile.Description,
                Email = includePrivateData && u.Profile != null ? u.Profile.Email : "",
                Country = includePrivateData && u.Profile != null ? u.Profile.Country : "",
                City = includePrivateData && u.Profile != null ? u.Profile.City : "",
                Street = includePrivateData && u.Profile != null ? u.Profile.Street : "",
                House = includePrivateData && u.Profile != null ? u.Profile.House : "",
                Apartment = includePrivateData && u.Profile != null ? u.Profile.Apartment : "",
                PickupPoint = includePrivateData && u.Profile != null ? u.Profile.PickupPoint : "",
                ShowFavorites = u.Profile == null || u.Profile.ShowFavorites,
                ShowOrderHistory = u.Profile != null && u.Profile.ShowOrderHistory,
                ShowStats = u.Profile == null || u.Profile.ShowStats
            })
            .FirstOrDefaultAsync();

        if (dto == null)
            return null;

        dto.CanViewStats = includeHiddenBlocks || dto.ShowStats;
        dto.CanViewFavorites = includeHiddenBlocks || dto.ShowFavorites;
        dto.CanViewOrderHistory = includeHiddenBlocks || dto.ShowOrderHistory;

        if (dto.CanViewStats)
            dto.Stats = await BuildStatsDto(userId);

        if (dto.CanViewFavorites)
            dto.FavoriteBooks = await BuildFavoriteBooks(userId);

        if (dto.CanViewOrderHistory)
            dto.Orders = await BuildOrders(userId);

        return dto;
    }

    private async Task<UserStatsDto?> BuildStatsDto(int userId)
    {
        return await _context.Users
            .Where(u => u.Id == userId)
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
    }

    private async Task<List<BookResponseDto>> BuildFavoriteBooks(int userId)
    {
        return await _context.FavoriteBooks
            .Where(f => f.UserId == userId)
            .Where(f => f.Book != null)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new BookResponseDto
            {
                Id = f.Book!.Id,
                Title = f.Book.Title,
                Author = f.Book.Author,
                Available = f.Book.Available,
                Price = f.Book.Price,
                Stock = f.Book.Stock,
                Description = f.Book.Description,
                ImageUrl = f.Book.ImageUrl,
                CreatedAt = f.Book.CreatedAt,
                CommentsNumber = f.Book.Comments.Count,
                AverageRating = f.Book.Comments.Count == 0
                    ? 0
                    : f.Book.Comments.Average(c => c.Rating),
                SoldCount = f.Book.OrderItems.Sum(i => (int?)i.Quantity) ?? 0,
                FavoritesCount = f.Book.FavoriteBooks.Count
            })
            .ToListAsync();
    }

    private async Task<List<OrderResponseDto>> BuildOrders(int userId)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.Date)
            .Select(o => new OrderResponseDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Date = o.Date,
                TotalPrice = o.TotalPrice,
                DeliveryAddress = o.DeliveryAddress,
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
    }
}
