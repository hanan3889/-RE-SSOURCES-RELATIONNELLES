using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        ressource.MotifsRefus = null;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH /api/moderateur/ressources/{id}/refuser
    [HttpPatch("ressources/{id:long}/refuser")]
    public async Task<IActionResult> Refuser(long id, [FromBody] RefuserDto dto)
    {
        var ressource = await _context.Ressources.FindAsync(id);
        if (ressource == null) return NotFound();

        ressource.Statut = Statut.Rejetee;
        ressource.MotifsRefus = dto.Motif;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class RefuserDto
{
    public string Motif { get; set; } = string.Empty;
}
