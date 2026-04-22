using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.CommentaireDto;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/moderateur")]
[Authorize(Roles = "moderateur,administrateur,super_administrateur")]
public class ModerationController : ControllerBase
{
    private readonly RRDbContext _context;

    public ModerationController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/moderateur/ressources — File d'attente
    [HttpGet("ressources")]
    public async Task<IActionResult> GetQueue()
    {
        var ressources = await _context.Ressources
            .Include(r => r.Utilisateur)
            .Include(r => r.Categorie)
            .Where(r => r.Statut == Statut.EnValidation)
            .OrderBy(r => r.DateCreation)
            .Select(r => new RessourceDto
            {
                IdRessource = r.IdRessource,
                Titre = r.Titre,
                Description = r.Description,
                Format = r.Format,
                Visibilite = r.Visibilite.ToString(),
                Statut = r.Statut.ToString(),
                DateCreation = r.DateCreation,
                IdUtilisateur = r.IdUtilisateur,
                NomAuteur = r.Utilisateur!.Nom,
                PrenomAuteur = r.Utilisateur.Prenom,
                IdCategorie = r.IdCategorie,
                NomCategorie = r.Categorie!.NomCategorie
            })
            .ToListAsync();

        return Ok(ressources);
    }

    // PATCH /api/moderateur/ressources/{id}/valider
    [HttpPatch("ressources/{id:long}/valider")]
    public async Task<IActionResult> Valider(long id)
    {
        var ressource = await _context.Ressources.FindAsync(id);
        if (ressource == null) return NotFound();

        ressource.Statut = Statut.Publiee;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH /api/moderateur/ressources/{id}/refuser
    [HttpPatch("ressources/{id:long}/refuser")]
    public async Task<IActionResult> Refuser(long id)
    {
        var ressource = await _context.Ressources.FindAsync(id);
        if (ressource == null) return NotFound();

        ressource.Statut = Statut.Rejetee;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET /api/moderateur/commentaires?ressourceId=1 — liste des commentaires pour modération
    [HttpGet("commentaires")]
    public async Task<IActionResult> GetCommentaires([FromQuery] long? ressourceId = null)
    {
        var query = _context.Commentaires
            .AsNoTracking()
            .Include(c => c.Utilisateur)
            .Include(c => c.Ressource)
            .AsQueryable();

        if (ressourceId.HasValue)
        {
            query = query.Where(c => c.IdRessource == ressourceId.Value);
        }

        var commentaires = await query
            .OrderByDescending(c => c.DateCreation)
            .Select(c => new ModerationCommentaireDto
            {
                IdCommentaire = c.IdCommentaire,
                IdCommentaireParent = c.IdCommentaireParent,
                Contenu = c.Contenu,
                DateCreation = c.DateCreation,
                IdUtilisateur = c.IdUtilisateur,
                NomAuteur = c.Utilisateur != null ? c.Utilisateur.Nom : string.Empty,
                PrenomAuteur = c.Utilisateur != null ? c.Utilisateur.Prenom : string.Empty,
                IdRessource = c.IdRessource,
                TitreRessource = c.Ressource != null ? c.Ressource.Titre : string.Empty
            })
            .ToListAsync();

        return Ok(commentaires);
    }

    // DELETE /api/moderateur/commentaires/{id} — suppression modérateur
    [HttpDelete("commentaires/{id:long}")]
    public async Task<IActionResult> DeleteCommentaire(long id)
    {
        var commentaire = await _context.Commentaires.FindAsync(id);
        if (commentaire == null) return NotFound();

        _context.Commentaires.Remove(commentaire);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
