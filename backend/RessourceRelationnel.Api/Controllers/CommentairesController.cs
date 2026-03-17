using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.CommentaireDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
public class CommentairesController : ControllerBase
{
    private readonly RRDbContext _context;

    public CommentairesController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/ressources/{ressourceId}/commentaires — lecture publique
    [HttpGet("api/ressources/{ressourceId:long}/commentaires")]
    public async Task<IActionResult> GetByRessource(long ressourceId)
    {
        var ressource = await _context.Ressources.FindAsync(ressourceId);
        if (ressource == null) return NotFound(new { message = "Ressource introuvable." });

        var commentaires = await _context.Commentaires
            .Where(c => c.IdRessource == ressourceId)
            .Include(c => c.Utilisateur)
            .OrderByDescending(c => c.DateCreation)
            .Select(c => ToDto(c))
            .ToListAsync();

        return Ok(commentaires);
    }

    // POST /api/ressources/{ressourceId}/commentaires — citoyen connecté
    [HttpPost("api/ressources/{ressourceId:long}/commentaires")]
    [Authorize]
    public async Task<IActionResult> Create(long ressourceId, [FromBody] CreateCommentaireDto dto)
    {
        var ressource = await _context.Ressources.FindAsync(ressourceId);
        if (ressource == null) return NotFound(new { message = "Ressource introuvable." });

        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var commentaire = new Commentaire
        {
            Contenu = dto.Contenu,
            IdUtilisateur = userId,
            IdRessource = ressourceId,
            DateCreation = DateTime.UtcNow
        };

        _context.Commentaires.Add(commentaire);
        await _context.SaveChangesAsync();

        await _context.Entry(commentaire).Reference(c => c.Utilisateur).LoadAsync();
        return Created("", ToDto(commentaire));
    }

    // DELETE /api/commentaires/{id} — auteur ou modérateur
    [HttpDelete("api/commentaires/{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id)
    {
        var commentaire = await _context.Commentaires.FindAsync(id);
        if (commentaire == null) return NotFound(new { message = "Commentaire introuvable." });

        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        bool isModo = role == "moderateur" || role == "administrateur" || role == "super_administrateur";
        if (!isModo && commentaire.IdUtilisateur != userId) return Forbid();

        _context.Commentaires.Remove(commentaire);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static CommentaireDto ToDto(Commentaire c) => new()
    {
        IdCommentaire = c.IdCommentaire,
        Contenu = c.Contenu,
        DateCreation = c.DateCreation,
        IdUtilisateur = c.IdUtilisateur,
        NomAuteur = c.Utilisateur?.Nom ?? "",
        PrenomAuteur = c.Utilisateur?.Prenom ?? "",
        IdRessource = c.IdRessource
    };
}
