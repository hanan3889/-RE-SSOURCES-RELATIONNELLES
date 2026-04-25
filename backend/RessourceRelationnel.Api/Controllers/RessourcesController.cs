using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/ressources")]
public class RessourcesController : ControllerBase
{
    private readonly RRDbContext _context;
    private const string InvitationType = "invitation";
    private const string AcceptedInvitationStatus = "accepted";

    public RessourcesController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/ressources — Liste publique avec filtres
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? categorie,
        [FromQuery] string? format,
        [FromQuery] string? recherche,
        [FromQuery] string? tri = "date")
    {
        var query = _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .Where(r => r.Statut == Statut.Publiee && r.Visibilite == Visibilite.Publique)
            .AsQueryable();

        if (!string.IsNullOrEmpty(categorie))
            query = query.Where(r => r.Categorie!.NomCategorie == categorie);

        if (!string.IsNullOrEmpty(format))
            query = query.Where(r => r.Format == format);

        if (!string.IsNullOrEmpty(recherche))
            query = query.Where(r => r.Titre.Contains(recherche) || r.Description.Contains(recherche));

        query = tri == "popularite"
            ? query.OrderByDescending(r => r.IdRessource)
            : query.OrderByDescending(r => r.DateCreation);

        var result = await query.Select(r => ToDto(r)).ToListAsync();
        return Ok(result);
    }

    // GET /api/ressources/restreintes — Ressources restreintes accessibles au citoyen connecté
    [HttpGet("restreintes")]
    [Authorize]
    public async Task<IActionResult> GetRestrictedAccessible(
        [FromQuery] string? categorie,
        [FromQuery] string? format,
        [FromQuery] string? recherche,
        [FromQuery] string? tri = "date")
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var accessibleByInvitationResourceIds = _context.Messages
            .Where(m => m.TypeMessage == "invitation"
                && m.IdDestinataire == userId
                && m.IdRessource.HasValue
                && m.StatutInvitation == "accepted")
            .Select(m => m.IdRessource!.Value)
            .Distinct();

        var query = _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .Where(r => r.Statut == Statut.Publiee
                && r.Visibilite == Visibilite.Connectes
                && (r.IdUtilisateur == userId || accessibleByInvitationResourceIds.Contains(r.IdRessource)))
            .AsQueryable();

        if (!string.IsNullOrEmpty(categorie))
            query = query.Where(r => r.Categorie!.NomCategorie == categorie);

        if (!string.IsNullOrEmpty(format))
            query = query.Where(r => r.Format == format);

        if (!string.IsNullOrEmpty(recherche))
            query = query.Where(r => r.Titre.Contains(recherche) || r.Description.Contains(recherche));

        query = tri == "popularite"
            ? query.OrderByDescending(r => r.IdRessource)
            : query.OrderByDescending(r => r.DateCreation);

        var result = await query.Select(r => ToDto(r)).ToListAsync();
        return Ok(result);
    }

    // GET /api/ressources/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var r = await _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .FirstOrDefaultAsync(r => r.IdRessource == id);

        if (r == null) return NotFound();

        // Public and published resources are openly accessible.
        if (r.Statut == Statut.Publiee && r.Visibilite == Visibilite.Publique)
        {
            return Ok(ToDto(r));
        }

        if (!User.Identity!.IsAuthenticated)
        {
            return NotFound();
        }

        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var isAdmin = role == "administrateur" || role == "super_administrateur";
        var isOwner = r.IdUtilisateur == userId;

        // Unpublished resources are only visible to owner/admin.
        if (r.Statut != Statut.Publiee)
        {
            if (!isAdmin && !isOwner)
                return NotFound();

            return Ok(ToDto(r));
        }

        // Published but restricted/private resources require owner/admin or accepted invitation.
        if (r.Visibilite != Visibilite.Publique)
        {
            var hasAcceptedInvitation = await _context.Messages.AnyAsync(m =>
                m.TypeMessage == InvitationType
                && m.IdRessource == r.IdRessource
                && m.IdDestinataire == userId
                && m.StatutInvitation == AcceptedInvitationStatus);

            if (!isAdmin && !isOwner && !hasAcceptedInvitation)
                return NotFound();
        }

        return Ok(ToDto(r));
    }

    // POST /api/ressources — Citoyen connecté
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateRessourceDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var isAdmin = role == "administrateur" || role == "super_administrateur";

        var categorie = await _context.Categories.FindAsync(dto.IdCategorie);
        if (categorie == null) return BadRequest(new { message = "Catégorie invalide." });
        if (IsAdminOnlyFormat(dto.Format) && !isAdmin)
            return Forbid();

        var ressource = new Ressource
        {
            Titre = dto.Titre,
            Description = dto.Description,
            Format = dto.Format,
            Visibilite = dto.Visibilite,
            Statut = Statut.EnValidation,
            IdUtilisateur = userId,
            IdCategorie = dto.IdCategorie,
            DateCreation = DateTime.UtcNow
        };

        _context.Ressources.Add(ressource);
        await _context.SaveChangesAsync();

        await _context.Entry(ressource).Reference(r => r.Utilisateur).LoadAsync();
        await _context.Entry(ressource).Reference(r => r.Categorie).LoadAsync();

        return Created("", ToDto(ressource));
    }

    // PUT /api/ressources/{id} — Auteur (si brouillon/refusée) ou Admin
    [HttpPut("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateRessourceDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var ressource = await _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .FirstOrDefaultAsync(r => r.IdRessource == id);

        if (ressource == null) return NotFound();

        bool isAdmin = role == "administrateur" || role == "super_administrateur";
        bool isOwner = ressource.IdUtilisateur == userId;

        if (!isAdmin && !isOwner) return Forbid();
        if (!isAdmin && ressource.Statut != Statut.Brouillon && ressource.Statut != Statut.Rejetee)
            return BadRequest(new { message = "Vous ne pouvez modifier cette ressource qu'à l'état brouillon ou refusée." });
        if (dto.Format != null && IsAdminOnlyFormat(dto.Format) && !isAdmin)
            return Forbid();

        if (dto.Titre != null) ressource.Titre = dto.Titre;
        if (dto.Description != null) ressource.Description = dto.Description;
        if (dto.Format != null) ressource.Format = dto.Format;
        if (dto.Visibilite.HasValue) ressource.Visibilite = dto.Visibilite.Value;
        if (dto.IdCategorie.HasValue) ressource.IdCategorie = dto.IdCategorie.Value;

        if (isOwner && !isAdmin)
            ressource.Statut = Statut.EnValidation;

        await _context.SaveChangesAsync();
        return Ok(ToDto(ressource));
    }

    // DELETE /api/ressources/{id}
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var ressource = await _context.Ressources.FindAsync(id);
        if (ressource == null) return NotFound();

        bool isAdmin = role == "administrateur" || role == "super_administrateur";
        if (!isAdmin && ressource.IdUtilisateur != userId) return Forbid();

        _context.Ressources.Remove(ressource);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH /api/admin/ressources/{id}/suspendre
    [HttpPatch("/api/admin/ressources/{id:long}/suspendre")]
    [Authorize(Roles = "administrateur,super_administrateur")]
    public async Task<IActionResult> Suspend(long id)
    {
        var ressource = await _context.Ressources.FindAsync(id);
        if (ressource == null) return NotFound();

        ressource.Statut = Statut.Archivee;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET /api/ressources/mes-ressources — Ressources du citoyen connecté
    [HttpGet("mes-ressources")]
    [Authorize]
    public async Task<IActionResult> MesRessources()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ressources = await _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .Where(r => r.IdUtilisateur == userId)
            .OrderByDescending(r => r.DateCreation)
            .Select(r => ToDto(r))
            .ToListAsync();
        return Ok(ressources);
    }

    // GET /api/admin/ressources — Toutes les ressources (Admin/Modérateur)
    [HttpGet("/api/admin/ressources")]
    [Authorize(Roles = "administrateur,super_administrateur,moderateur")]
    public async Task<IActionResult> GetAllAdmin(
        [FromQuery] string? statut,
        [FromQuery] string? categorie,
        [FromQuery] string? format,
        [FromQuery] string? visibilite,
        [FromQuery] string? auteur,
        [FromQuery] string? recherche)
    {
        var query = _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statut) && Enum.TryParse<Statut>(statut, true, out var statutEnum))
            query = query.Where(r => r.Statut == statutEnum);

        if (!string.IsNullOrWhiteSpace(categorie))
            query = query.Where(r => r.Categorie != null && r.Categorie.NomCategorie == categorie);

        if (!string.IsNullOrWhiteSpace(format))
            query = query.Where(r => r.Format == format);

        if (!string.IsNullOrWhiteSpace(visibilite) && Enum.TryParse<Visibilite>(visibilite, true, out var visibiliteEnum))
            query = query.Where(r => r.Visibilite == visibiliteEnum);

        if (!string.IsNullOrWhiteSpace(auteur))
        {
            var trimmedAuteur = auteur.Trim();
            query = query.Where(r => r.Utilisateur != null
                && ((r.Utilisateur.Prenom + " " + r.Utilisateur.Nom).Contains(trimmedAuteur)
                    || (r.Utilisateur.Nom + " " + r.Utilisateur.Prenom).Contains(trimmedAuteur)
                    || r.Utilisateur.Nom.Contains(trimmedAuteur)
                    || r.Utilisateur.Prenom.Contains(trimmedAuteur)));
        }

        if (!string.IsNullOrWhiteSpace(recherche))
        {
            var trimmedRecherche = recherche.Trim();
            query = query.Where(r => r.Titre.Contains(trimmedRecherche) || r.Description.Contains(trimmedRecherche));
        }

        var result = await query.OrderByDescending(r => r.DateCreation).Select(r => ToDto(r)).ToListAsync();
        return Ok(result);
    }

    private static bool IsAdminOnlyFormat(string? format)
    {
        if (string.IsNullOrWhiteSpace(format)) return false;

        var normalized = format
            .Trim()
            .Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .ToArray();

        var normalizedFormat = new string(normalized)
            .ToLowerInvariant();

        return normalizedFormat == "activite" || normalizedFormat == "jeu";
    }

    private static RessourceDto ToDto(Ressource r) => new()
    {
        IdRessource = r.IdRessource,
        Titre = r.Titre,
        Description = r.Description,
        Format = r.Format,
        Visibilite = r.Visibilite.ToString(),
        Statut = r.Statut.ToString(),
        DateCreation = r.DateCreation,
        IdUtilisateur = r.IdUtilisateur,
        NomAuteur = r.Utilisateur?.Nom ?? "",
        PrenomAuteur = r.Utilisateur?.Prenom ?? "",
        IdCategorie = r.IdCategorie,
        NomCategorie = r.Categorie?.NomCategorie ?? ""
    };
}
