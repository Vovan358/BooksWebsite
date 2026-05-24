public class LeaderboardRowDto
{
    public int Rank { get; set; }

    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int BooksBought { get; set; }

    public int MoneySpent { get; set; }

    public int CommentsLeft { get; set; }
}

public class LeaderboardResponseDto
{
    public string SortBy { get; set; } = string.Empty;

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalUsers { get; set; }

    public List<LeaderboardRowDto> Rows { get; set; } = new();

    public UserLeaderboardRanksDto? CurrentUserRanks { get; set; }
}

public class UserLeaderboardRanksDto
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int BooksBoughtRank { get; set; }

    public int MoneySpentRank { get; set; }

    public int CommentsLeftRank { get; set; }
}
