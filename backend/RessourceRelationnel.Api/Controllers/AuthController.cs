using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Api.Services;
using RessourceRelationnel.Domain.DTOs.AuthDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly RRDbContext _context;
    private readonly JwtService _jwt;

    public AuthController(RRDbContext context, JwtService jwt)
    {
        _context = context;
        _jwt = jwt;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Cet email est déjà utilisé." });

        var rolecitoyen = await _context.Roles.FirstOrDefaultAsync(r => r.NomRole == "citoyen");
        if (rolecitoyen == null)
            return StatusCode(500, new { message = "Rôle citoyen introuvable." });

        var user = new Utilisateur
        {
            Nom = dto.Nom,
            Prenom = dto.Prenom,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IdRole = rolecitoyen.IdRole,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Utilisateurs.Add(user);
        await _context.SaveChangesAsync();

        user.Role = rolecitoyen;
        var token = _jwt.GenerateToken(user);

        return Created("", new AuthResponseDto
        {
            Token = token,
            IdUtilisateur = user.IdUtilisateur,
            Email = user.Email,
            Nom = user.Nom,
            Prenom = user.Prenom,
            Role = rolecitoyen.NomRole
        });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Utilisateurs
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Ce compte est désactivé." });

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            IdUtilisateur = user.IdUtilisateur,
            Email = user.Email,
            Nom = user.Nom,
            Prenom = user.Prenom,
            Role = user.Role?.NomRole ?? "citoyen"
        });
    }
}
