using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/ressources/{ressourceId:long}/favoris")]
[Authorize]
public class FavorisController : ControllerBase
{
    private readonly RRDbContext _context;

    public FavorisController(RRDbContext context)
    {
        _context = context;
    }

    // POST /api/ressources/{ressourceId}/favoris
    [HttpPost]
    public async Task<IActionResult> Ajouter(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressource = await _context.Ressources.FindAsync(ressourceId);
        if (ressource == null) return NotFound(new { message = "Ressource introuvable." });

        var existe = await _context.Favoris
            .AnyAsync(f => f.IdUtilisateur == userId && f.IdRessource == ressourceId);

        if (existe) return Conflict(new { message = "Déjà dans les favoris." });

        _context.Favoris.Add(new Favori
        {
            IdUtilisateur = userId,
            IdRessource = ressourceId,
            DateAjout = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return Created("", new { message = "Ajouté aux favoris." });
    }

    // DELETE /api/ressources/{ressourceId}/favoris
    [HttpDelete]
    public async Task<IActionResult> Retirer(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var favori = await _context.Favoris
            .FirstOrDefaultAsync(f => f.IdUtilisateur == userId && f.IdRessource == ressourceId);

        if (favori == null) return NotFound(new { message = "Favori introuvable." });

        _context.Favoris.Remove(favori);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/ressources/favoris — liste des favoris du citoyen connecté
    [HttpGet("/api/ressources/favoris")]
    public async Task<IActionResult> MesFavoris()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var favoris = await _context.Favoris
            .Where(f => f.IdUtilisateur == userId)
            .Include(f => f.Ressource!.Utilisateur)
            .Include(f => f.Ressource!.Categorie)
            .Select(f => new RessourceDto
            {
                IdRessource = f.Ressource!.IdRessource,
                Titre = f.Ressource.Titre,
                Description = f.Ressource.Description,
                Format = f.Ressource.Format,
                Visibilite = f.Ressource.Visibilite.ToString(),
                Statut = f.Ressource.Statut.ToString(),
                DateCreation = f.Ressource.DateCreation,
                IdUtilisateur = f.Ressource.IdUtilisateur,
                NomAuteur = f.Ressource.Utilisateur!.Nom,
                PrenomAuteur = f.Ressource.Utilisateur.Prenom,
                IdCategorie = f.Ressource.IdCategorie,
                NomCategorie = f.Ressource.Categorie!.NomCategorie
            })
            .ToListAsync();

        return Ok(favoris);
    }
}
