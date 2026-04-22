using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/progression")]
[Authorize]
public class ProgressionController : ControllerBase
{
    private readonly RRDbContext _context;
    private const string ExploiteeSuffix = ":exploitee";
    private const string SauvegardeeSuffix = ":saved";
    private const string DemarreeSuffix = ":started";

    public ProgressionController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/progression — Dashboard citoyen connecté
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var nbFavoris = await _context.Favoris.CountAsync(f => f.IdUtilisateur == userId);
        var nbMesRessources = await _context.Ressources.CountAsync(r => r.IdUtilisateur == userId);
        var nbPubliees = await _context.Ressources.CountAsync(r => r.IdUtilisateur == userId && r.Statut == Statut.Publiee);
        var nbEnAttente = await _context.Ressources.CountAsync(r => r.IdUtilisateur == userId && r.Statut == Statut.EnValidation);
        var nbExploitees = await _context.Progressions.CountAsync(p =>
            p.IdUtilisateur == userId
            && p.Valeur.StartsWith("ressource:")
            && p.Valeur.EndsWith(ExploiteeSuffix));
        var nbSauvegardees = await _context.Progressions.CountAsync(p =>
            p.IdUtilisateur == userId
            && p.Valeur.StartsWith("ressource:")
            && p.Valeur.EndsWith(SauvegardeeSuffix));
        var nbActivitesDemarrees = await _context.Progressions.CountAsync(p =>
            p.IdUtilisateur == userId
            && p.Valeur.StartsWith("ressource:")
            && p.Valeur.EndsWith(DemarreeSuffix));

        return Ok(new
        {
            nbFavoris,
            nbMesRessources,
            nbPubliees,
            nbEnAttente,
            nbExploitees,
            nbSauvegardees,
            nbActivitesDemarrees
        });
    }

    // GET /api/progression/ressources/{ressourceId}/exploitation
    [HttpGet("ressources/{ressourceId:long}/exploitation")]
    public async Task<IActionResult> GetExploitationStatus(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressourceExists = await _context.Ressources.AnyAsync(r => r.IdRessource == ressourceId);
        if (!ressourceExists) return NotFound(new { message = "Ressource introuvable." });

        var key = BuildExploiteeKey(ressourceId);
        var exploitee = await _context.Progressions.AnyAsync(p => p.IdUtilisateur == userId && p.Valeur == key);

        return Ok(new { ressourceId, exploitee });
    }

    // GET /api/progression/ressources/{ressourceId}/sauvegarde
    [HttpGet("ressources/{ressourceId:long}/sauvegarde")]
    public async Task<IActionResult> GetSauvegardeStatus(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressourceExists = await _context.Ressources.AnyAsync(r => r.IdRessource == ressourceId);
        if (!ressourceExists) return NotFound(new { message = "Ressource introuvable." });

        var key = BuildSauvegardeeKey(ressourceId);
        var sauvegardee = await _context.Progressions.AnyAsync(p => p.IdUtilisateur == userId && p.Valeur == key);

        return Ok(new { ressourceId, sauvegardee });
    }

    // GET /api/progression/ressources/{ressourceId}/demarrage
    [HttpGet("ressources/{ressourceId:long}/demarrage")]
    public async Task<IActionResult> GetDemarrageStatus(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressource = await _context.Ressources.FirstOrDefaultAsync(r => r.IdRessource == ressourceId);
        if (ressource == null) return NotFound(new { message = "Ressource introuvable." });
        if (!IsDemarrableFormat(ressource.Format))
            return BadRequest(new { message = "Cette ressource n'est pas une activité ou un jeu démarrable." });

        var key = BuildDemarreeKey(ressourceId);
        var demarree = await _context.Progressions.AnyAsync(p => p.IdUtilisateur == userId && p.Valeur == key);

        return Ok(new { ressourceId, demarree });
    }

    // PUT /api/progression/ressources/{ressourceId}/exploitation
    [HttpPut("ressources/{ressourceId:long}/exploitation")]
    public async Task<IActionResult> SetExploitationStatus(long ressourceId, [FromBody] SetExploitationDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressourceExists = await _context.Ressources.AnyAsync(r => r.IdRessource == ressourceId);
        if (!ressourceExists) return NotFound(new { message = "Ressource introuvable." });

        var key = BuildExploiteeKey(ressourceId);
        var existing = await _context.Progressions
            .Where(p => p.IdUtilisateur == userId && p.Valeur == key)
            .ToListAsync();

        if (dto.Exploitee)
        {
            if (!existing.Any())
            {
                _context.Progressions.Add(new Progression
                {
                    IdUtilisateur = userId,
                    Valeur = key
                });
            }
        }
        else if (existing.Any())
        {
            _context.Progressions.RemoveRange(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(new { ressourceId, exploitee = dto.Exploitee });
    }

    // PUT /api/progression/ressources/{ressourceId}/sauvegarde
    [HttpPut("ressources/{ressourceId:long}/sauvegarde")]
    public async Task<IActionResult> SetSauvegardeStatus(long ressourceId, [FromBody] SetSauvegardeDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressourceExists = await _context.Ressources.AnyAsync(r => r.IdRessource == ressourceId);
        if (!ressourceExists) return NotFound(new { message = "Ressource introuvable." });

        var key = BuildSauvegardeeKey(ressourceId);
        var existing = await _context.Progressions
            .Where(p => p.IdUtilisateur == userId && p.Valeur == key)
            .ToListAsync();

        if (dto.Sauvegardee)
        {
            if (!existing.Any())
            {
                _context.Progressions.Add(new Progression
                {
                    IdUtilisateur = userId,
                    Valeur = key
                });
            }
        }
        else if (existing.Any())
        {
            _context.Progressions.RemoveRange(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(new { ressourceId, sauvegardee = dto.Sauvegardee });
    }

    // PUT /api/progression/ressources/{ressourceId}/demarrage
    [HttpPut("ressources/{ressourceId:long}/demarrage")]
    public async Task<IActionResult> SetDemarrageStatus(long ressourceId, [FromBody] SetDemarrageDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressource = await _context.Ressources.FirstOrDefaultAsync(r => r.IdRessource == ressourceId);
        if (ressource == null) return NotFound(new { message = "Ressource introuvable." });
        if (!IsDemarrableFormat(ressource.Format))
            return BadRequest(new { message = "Cette ressource n'est pas une activité ou un jeu démarrable." });

        var key = BuildDemarreeKey(ressourceId);
        var existing = await _context.Progressions
            .Where(p => p.IdUtilisateur == userId && p.Valeur == key)
            .ToListAsync();

        if (dto.Demarree)
        {
            if (!existing.Any())
            {
                _context.Progressions.Add(new Progression
                {
                    IdUtilisateur = userId,
                    Valeur = key
                });
            }
        }
        else if (existing.Any())
        {
            _context.Progressions.RemoveRange(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(new { ressourceId, demarree = dto.Demarree });
    }

    private static string BuildExploiteeKey(long ressourceId) => $"ressource:{ressourceId}{ExploiteeSuffix}";
    private static string BuildSauvegardeeKey(long ressourceId) => $"ressource:{ressourceId}{SauvegardeeSuffix}";
    private static string BuildDemarreeKey(long ressourceId) => $"ressource:{ressourceId}{DemarreeSuffix}";

    private static bool IsDemarrableFormat(string? format)
    {
        if (string.IsNullOrWhiteSpace(format)) return false;

        var normalized = format
            .Trim()
            .Normalize()
            .ToLowerInvariant();

        return normalized is "activite" or "activité" or "jeu";
    }

    public sealed class SetExploitationDto
    {
        public bool Exploitee { get; set; }
    }

    public sealed class SetSauvegardeDto
    {
        public bool Sauvegardee { get; set; }
    }

    public sealed class SetDemarrageDto
    {
        public bool Demarree { get; set; }
    }
}
