public class UserProfileDto
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string AvatarUrl { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string House { get; set; } = string.Empty;

    public string Apartment { get; set; } = string.Empty;

    public string PickupPoint { get; set; } = string.Empty;

    public bool ShowFavorites { get; set; }

    public bool ShowOrderHistory { get; set; }

    public bool ShowStats { get; set; }

    public bool CanViewFavorites { get; set; }

    public bool CanViewOrderHistory { get; set; }

    public bool CanViewStats { get; set; }

    public UserStatsDto? Stats { get; set; }

    public List<BookResponseDto> FavoriteBooks { get; set; } = new();

    public List<OrderResponseDto> Orders { get; set; } = new();
}
