using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private const string BooksCacheKey = "books_cache";

    private readonly AppDbContext _context;
    private readonly IDistributedCache _redis;

    public AdminController(AppDbContext context, IDistributedCache redis)
    {
        _context = context;
        _redis = redis;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var commentsWithRatings = _context.Comments;

        var dashboard = new AdminDashboardDto
        {
            Revenue = await _context.Orders.SumAsync(o => (int?)o.TotalPrice) ?? 0,
            OrdersCount = await _context.Orders.CountAsync(),
            UsersCount = await _context.Users.CountAsync(),
            CommentsCount = await _context.Comments.CountAsync(),
            BooksBought = await _context.OrderItems.SumAsync(i => (int?)i.Quantity) ?? 0,
            AverageBookRating = await commentsWithRatings.AnyAsync()
                ? await commentsWithRatings.AverageAsync(c => c.Rating)
                : 0
        };

        return Ok(dashboard);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        string search = "",
        string sortBy = "createdAt",
        string direction = "desc",
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            query = query.Where(u => u.Username.Contains(normalizedSearch));
        }

        query = sortBy switch
        {
            "username" => direction == "desc"
                ? query.OrderByDescending(u => u.Username)
                : query.OrderBy(u => u.Username),
            "createdAt" => direction == "asc"
                ? query.OrderBy(u => u.CreatedAt)
                : query.OrderByDescending(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        return Ok(await ToPagedResult(
            query.Select(u => new AdminUserDto
            {
                Id = u.Id,
                Username = u.Username,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }),
            page,
            pageSize));
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        string search = "",
        string sortBy = "date",
        string direction = "desc",
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            query = query.Where(o => o.User != null && o.User.Username.Contains(normalizedSearch));
        }

        query = sortBy switch
        {
            "itemsCount" => direction == "desc"
                ? query.OrderByDescending(o => o.Items.Sum(i => i.Quantity))
                : query.OrderBy(o => o.Items.Sum(i => i.Quantity)),
            "totalPrice" => direction == "desc"
                ? query.OrderByDescending(o => o.TotalPrice)
                : query.OrderBy(o => o.TotalPrice),
            "date" => direction == "asc"
                ? query.OrderBy(o => o.Date)
                : query.OrderByDescending(o => o.Date),
            _ => query.OrderByDescending(o => o.Date)
        };

        return Ok(await ToPagedResult(
            query.Select(o => new AdminOrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Username = o.User == null ? "" : o.User.Username,
                Date = o.Date,
                ItemsCount = o.Items.Sum(i => i.Quantity),
                TotalPrice = o.TotalPrice,
                Books = o.Items.Select(i => new OrderHistoryItemDto
                {
                    BookId = i.BookId,
                    Title = i.Book == null ? "" : i.Book.Title,
                    Author = i.Book == null ? "" : i.Book.Author,
                    ImageUrl = i.Book == null ? "" : i.Book.ImageUrl,
                    Quantity = i.Quantity,
                    PriceAtMoment = i.PriceAtMoment
                }).ToList()
            }),
            page,
            pageSize));
    }

    [HttpGet("comments")]
    public async Task<IActionResult> GetComments(
        string search = "",
        bool onlyReported = false,
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.Comments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            query = query.Where(c => c.Author.Contains(normalizedSearch));
        }

        if (onlyReported)
            query = query.Where(c => c.Reports.Any());

        query = query.OrderByDescending(c => c.CreatedAt);

        return Ok(await ToPagedResult(
            query.Select(c => new AdminCommentDto
            {
                Id = c.Id,
                BookId = c.BookId,
                BookName = c.Book == null ? "" : c.Book.Title,
                UserId = c.UserId,
                Username = c.Author,
                Description = c.Text,
                Rating = c.Rating,
                CommentRating = c.Votes.Sum(v => (int?)v.Value) ?? 0,
                ReportsCount = c.Reports.Count,
                HasReports = c.Reports.Any(),
                CreatedAt = c.CreatedAt
            }),
            page,
            pageSize));
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);

        if (comment == null)
            return NotFound();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return NoContent();
    }

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks(
        string search = "",
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();
            query = query.Where(b =>
                b.Title.Contains(normalizedSearch) ||
                b.Author.Contains(normalizedSearch));
        }

        query = query.OrderBy(b => b.Id);

        return Ok(await ToPagedResult(
            query.Select(b => new AdminBookDto
            {
                Id = b.Id,
                BookName = b.Title,
                Author = b.Author,
                Price = b.Price,
                Stock = b.Stock,
                Available = b.Available,
                IsHidden = b.IsHidden,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                CreatedAt = b.CreatedAt,
                Rating = b.Comments.Count == 0 ? 0 : b.Comments.Average(c => c.Rating),
                Orders = b.OrderItems.Sum(i => (int?)i.Quantity) ?? 0,
                CommentsNumber = b.Comments.Count,
                FavoritesCount = b.FavoriteBooks.Count
            }),
            page,
            pageSize));
    }

    [HttpPost("books")]
    public async Task<IActionResult> CreateBook([FromBody] AdminBookUpsertDto dto)
    {
        var validation = ValidateBookDto(dto);
        if (validation != null)
            return validation;

        var book = new Book
        {
            Title = dto.Title.Trim(),
            Author = dto.Author.Trim(),
            Price = dto.Price,
            Stock = dto.Stock,
            Available = dto.Stock > 0,
            IsHidden = dto.IsHidden,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return Ok(await BuildAdminBook(book.Id));
    }

    [HttpPut("books/{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] AdminBookUpsertDto dto)
    {
        var validation = ValidateBookDto(dto);
        if (validation != null)
            return validation;

        var book = await _context.Books.FindAsync(id);

        if (book == null)
            return NotFound();

        book.Title = dto.Title.Trim();
        book.Author = dto.Author.Trim();
        book.Price = dto.Price;
        book.Stock = dto.Stock;
        book.Available = dto.Stock > 0;
        book.IsHidden = dto.IsHidden;
        book.Description = dto.Description;
        book.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        await UpdateStockGauge();

        return Ok(await BuildAdminBook(id));
    }

    [HttpDelete("books/{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
            return NotFound();

        var hasOrders = await _context.OrderItems.AnyAsync(i => i.BookId == id);
        if (hasOrders)
            return BadRequest("Book has orders and cannot be deleted");

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);
        await UpdateStockGauge();

        return NoContent();
    }

    [HttpDelete("books/{id}/comments")]
    public async Task<IActionResult> ClearBookComments(int id)
    {
        var bookExists = await _context.Books.AnyAsync(b => b.Id == id);
        if (!bookExists)
            return NotFound();

        var comments = await _context.Comments
            .Where(c => c.BookId == id)
            .ToListAsync();

        _context.Comments.RemoveRange(comments);
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return NoContent();
    }

    [HttpPatch("books/{id}/hidden")]
    public async Task<IActionResult> SetBookHidden(int id, [FromBody] AdminBookHiddenDto dto)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
            return NotFound();

        book.IsHidden = dto.IsHidden;
        await _context.SaveChangesAsync();
        await _redis.RemoveAsync(BooksCacheKey);

        return Ok(await BuildAdminBook(id));
    }

    private IActionResult? ValidateBookDto(AdminBookUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required");

        if (string.IsNullOrWhiteSpace(dto.Author))
            return BadRequest("Author is required");

        if (dto.Price < 0)
            return BadRequest("Price cannot be negative");

        if (dto.Stock < 0)
            return BadRequest("Stock cannot be negative");

        return null;
    }

    private async Task<AdminBookDto> BuildAdminBook(int id)
    {
        return await _context.Books
            .Where(b => b.Id == id)
            .Select(b => new AdminBookDto
            {
                Id = b.Id,
                BookName = b.Title,
                Author = b.Author,
                Price = b.Price,
                Stock = b.Stock,
                Available = b.Available,
                IsHidden = b.IsHidden,
                Description = b.Description,
                ImageUrl = b.ImageUrl,
                CreatedAt = b.CreatedAt,
                Rating = b.Comments.Count == 0 ? 0 : b.Comments.Average(c => c.Rating),
                Orders = b.OrderItems.Sum(i => (int?)i.Quantity) ?? 0,
                CommentsNumber = b.Comments.Count,
                FavoritesCount = b.FavoriteBooks.Count
            })
            .FirstAsync();
    }

    private async Task<PagedResultDto<T>> ToPagedResult<T>(
        IQueryable<T> query,
        int page,
        int pageSize)
    {
        var safePage = Math.Max(page, 1);
        var safePageSize = Math.Clamp(pageSize, 1, 100);
        var totalItems = await query.CountAsync();
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalItems / (double)safePageSize));
        safePage = Math.Min(safePage, totalPages);

        var items = await query
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .ToListAsync();

        return new PagedResultDto<T>
        {
            Page = safePage,
            PageSize = safePageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items
        };
    }

    private async Task UpdateStockGauge()
    {
        var totalStock = await _context.Books.SumAsync(b => b.Stock);
        AppMetrics.BooksInStockGauge.Set(totalStock);
    }
}
