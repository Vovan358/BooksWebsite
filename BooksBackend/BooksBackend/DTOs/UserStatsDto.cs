public class UserStatsDto
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int OrdersCount { get; set; }

    public int BooksBought { get; set; }

    public int MoneySpent { get; set; }

    public int CommentsLeft { get; set; }
}
