public class PagedResultDto<T>
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalItems { get; set; }

    public int TotalPages { get; set; }

    public List<T> Items { get; set; } = new();
}

public class AdminDashboardDto
{
    public int Revenue { get; set; }

    public int OrdersCount { get; set; }

    public int UsersCount { get; set; }

    public int CommentsCount { get; set; }

    public int BooksBought { get; set; }

    public double AverageBookRating { get; set; }
}

public class AdminUserDto
{
    public int Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

public class AdminOrderDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public int ItemsCount { get; set; }

    public int TotalPrice { get; set; }

    public List<OrderHistoryItemDto> Books { get; set; } = new();
}

public class AdminCommentDto
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public string BookName { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Rating { get; set; }

    public int CommentRating { get; set; }

    public int ReportsCount { get; set; }

    public bool HasReports { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class AdminBookDto
{
    public int Id { get; set; }

    public string BookName { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public int Price { get; set; }

    public int Stock { get; set; }

    public bool Available { get; set; }

    public bool IsHidden { get; set; }

    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public double Rating { get; set; }

    public int Orders { get; set; }

    public int CommentsNumber { get; set; }

    public int FavoritesCount { get; set; }
}

public class AdminBookUpsertDto
{
    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public int Price { get; set; }

    public int Stock { get; set; }

    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsHidden { get; set; }
}

public class AdminBookHiddenDto
{
    public bool IsHidden { get; set; }
}
