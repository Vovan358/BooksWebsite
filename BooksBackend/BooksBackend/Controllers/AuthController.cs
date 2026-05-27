using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    // 🟢 REGISTER
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User dto)
    {
        Console.WriteLine($"DTO: {dto?.Username} / {dto?.PasswordHash}");
        var exists = await _context.Users
            .AnyAsync(u => u.Username == dto.Username);

        if (exists)
            return BadRequest("User already exists");

        string UserRole = "";
        if (dto.Username == "admin")
        {
            UserRole = "Admin";

        }
        else UserRole = "User";

        var user = new User
        {
            Username = dto.Username,
            Role = UserRole,
            CreatedAt = DateTime.UtcNow,
            Profile = new UserProfile()
        };


        user.PasswordHash = _hasher.HashPassword(user, dto.PasswordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Username });
    }

    // 🔵 LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null)
            return Unauthorized("Invalid username or password");

        if (string.IsNullOrEmpty(user.Role)) 
            user.Role = "User";
            var result = _hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid username or password");

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            username = user.Username
        });
    }

    // SAVE COOKIES 
    [HttpPost("cookie")]
    public IActionResult SetCookie([FromBody] string username)
    {
        Response.Cookies.Append("username", username, new CookieOptions
        {
            HttpOnly = false,
            Expires = DateTimeOffset.Now.AddDays(7),
            SameSite = SameSiteMode.None,
            Secure = true
        });

        return Ok("Cookie saved");
    }

    // READ COOKIES
    [HttpGet("cookie")]
    public IActionResult GetCookie()
    {
        var username = Request.Cookies["username"];
        return Ok(new { username });
    }

    // SAVE SESSION
    [HttpPost("session")]
    public IActionResult SetSession([FromBody] string username)
    {
        HttpContext.Session.SetString("username", username);
        return Ok("Session saved");
    }

    // READ SESSION
    [HttpGet("session")]
    public IActionResult GetSession()
    {
        var username = HttpContext.Session.GetString("username");
        return Ok(new { username });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("username");

        HttpContext.Session.Clear();

        return Ok("Logged out");
    }

    // JWT generator
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
