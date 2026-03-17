using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.AuthDto;
using RessourceRelationnel.Domain.DTOs.Utilisateurs;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;
using RessourceRelationnel.Api.Services;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class UtilisateursController : ControllerBase
{
    private readonly RRDbContext _context;
    private readonly JwtService _jwt;

    public UtilisateursController(RRDbContext context, JwtService jwt)
    {
        _context = context;
        _jwt = jwt;
    }

    // GET /api/users — Admin : liste tous les utilisateurs
    [HttpGet("users")]
    [Authorize(Roles = "administrateur,super_administrateur")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Utilisateurs
            .Include(u => u.Role)
            .Select(u => ToDto(u))
            .ToListAsync();

        return Ok(users);
    }

    // GET /api/users/{id}
    [HttpGet("users/{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var currentId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var currentRole = User.FindFirstValue(ClaimTypes.Role);

        if (id != currentId && currentRole != "administrateur" && currentRole != "super_administrateur")
            return Forbid();

        var user = await _context.Utilisateurs.Include(u => u.Role).FirstOrDefaultAsync(u => u.IdUtilisateur == id);
        if (user == null) return NotFound();

        return Ok(ToDto(user));
    }

    // PUT /api/users/{id}
    [HttpPut("users/{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateUtilisateurDto dto)
    {
        var currentId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var currentRole = User.FindFirstValue(ClaimTypes.Role);

        if (id != currentId && currentRole != "administrateur" && currentRole != "super_administrateur")
            return Forbid();

        var user = await _context.Utilisateurs.Include(u => u.Role).FirstOrDefaultAsync(u => u.IdUtilisateur == id);
        if (user == null) return NotFound();

        if (dto.Nom != null) user.Nom = dto.Nom;
        if (dto.Prenom != null) user.Prenom = dto.Prenom;

        // Seul admin/super-admin peut changer le rôle et le statut
        if (currentRole == "administrateur" || currentRole == "super_administrateur")
        {
            if (dto.IdRole.HasValue) user.IdRole = dto.IdRole.Value;
            if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _context.Entry(user).Reference(u => u.Role).LoadAsync();
        return Ok(ToDto(user));
    }

    // PATCH /api/admin/utilisateurs/{id}/statut
    [HttpPatch("admin/utilisateurs/{id:long}/statut")]
    [Authorize(Roles = "administrateur,super_administrateur")]
    public async Task<IActionResult> ToggleStatut(long id, [FromBody] bool isActive)
    {
        var user = await _context.Utilisateurs.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST /api/users/{id}/reset-password
    [HttpPost("users/{id:long}/reset-password")]
    [Authorize(Roles = "administrateur,super_administrateur")]
    public async Task<IActionResult> ResetPassword(long id, [FromBody] ResetPasswordDto dto)
    {
        var user = await _context.Utilisateurs.FindAsync(id);
        if (user == null) return NotFound();

        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/users/{id}
    [HttpDelete("users/{id:long}")]
    [Authorize(Roles = "super_administrateur")]
    public async Task<IActionResult> Delete(long id)
    {
        var user = await _context.Utilisateurs.FindAsync(id);
        if (user == null) return NotFound();

        _context.Utilisateurs.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST /api/superadmin/utilisateurs — Créer un compte privilégié
    [HttpPost("superadmin/utilisateurs")]
    [Authorize(Roles = "super_administrateur")]
    public async Task<IActionResult> CreatePrivilegedUser([FromBody] CreatePrivilegedUserDto dto)
    {
        if (await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Cet email est déjà utilisé." });

        var role = await _context.Roles.FindAsync(dto.IdRole);
        if (role == null) return BadRequest(new { message = "Rôle invalide." });

        var user = new Utilisateur
        {
            Nom = dto.Nom,
            Prenom = dto.Prenom,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IdRole = dto.IdRole,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Utilisateurs.Add(user);
        await _context.SaveChangesAsync();

        return Created("", ToDto(user));
    }

    private static UtilisateurDto ToDto(Utilisateur u) => new()
    {
        IdUtilisateur = u.IdUtilisateur,
        Nom = u.Nom,
        Prenom = u.Prenom,
        Email = u.Email,
        IsActive = u.IsActive,
        IsEmailVerified = u.IsEmailVerified,
        CreatedAt = u.CreatedAt,
        UpdatedAt = u.UpdatedAt,
        LastLoginAt = u.LastLoginAt,
        IdRole = u.IdRole,
        NomRole = u.Role?.NomRole
    };
}

public class ResetPasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

public class CreatePrivilegedUserDto
{
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public long IdRole { get; set; }
}
