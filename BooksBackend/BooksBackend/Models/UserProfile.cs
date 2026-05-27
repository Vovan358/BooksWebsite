using System.ComponentModel.DataAnnotations;

public class UserProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string AvatarUrl { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Description { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string House { get; set; } = string.Empty;

    public string Apartment { get; set; } = string.Empty;

    public string PickupPoint { get; set; } = string.Empty;

    public bool ShowFavorites { get; set; } = true;

    public bool ShowOrderHistory { get; set; } = false;

    public bool ShowStats { get; set; } = true;

    public User? User { get; set; }
}
