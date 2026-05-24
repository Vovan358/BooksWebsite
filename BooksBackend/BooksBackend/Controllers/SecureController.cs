using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SecureController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok("Public endpoint - доступен всем");
    }

    [HttpGet("user")]
    [Authorize]
    public IActionResult UserOnly()
    {
        return Ok($"Hello {User.Identity?.Name}");
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok("Admin panel access granted");
    }
}