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

        return Ok(new
        {
            nbFavoris,
            nbMesRessources,
            nbPubliees,
            nbEnAttente
        });
    }
}
