using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.MessageDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly RRDbContext _context;

    public MessagesController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/messages — Messages de l'utilisateur connecté
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messages = await _context.Messages
            .Include(m => m.Utilisateur)
            .Where(m => m.IdUtilisateur == userId)
            .OrderByDescending(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    // GET /api/messages/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var message = await _context.Messages
            .Include(m => m.Utilisateur)
            .FirstOrDefaultAsync(m => m.IdMessage == id);

        if (message == null) return NotFound();

        bool isAdmin = role == "administrateur" || role == "super_administrateur";
        if (message.IdUtilisateur != userId && !isAdmin) return Forbid();

        return Ok(ToDto(message));
    }

    // POST /api/messages
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMessageDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var message = new Message
        {
            Contenu = dto.Contenu,
            IdUtilisateur = userId,
            DateCreation = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        await _context.Entry(message).Reference(m => m.Utilisateur).LoadAsync();

        return Created("", ToDto(message));
    }

    // DELETE /api/messages/{id}
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var message = await _context.Messages.FindAsync(id);
        if (message == null) return NotFound();

        bool isAdmin = role == "administrateur" || role == "super_administrateur";
        if (message.IdUtilisateur != userId && !isAdmin) return Forbid();

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET /api/admin/messages — Tous les messages (Admin)
    [HttpGet("/api/admin/messages")]
    [Authorize(Roles = "administrateur,super_administrateur")]
    public async Task<IActionResult> GetAll()
    {
        var messages = await _context.Messages
            .Include(m => m.Utilisateur)
            .OrderByDescending(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    private static MessageDto ToDto(Message m) => new()
    {
        IdMessage = m.IdMessage,
        Contenu = m.Contenu,
        DateCreation = m.DateCreation,
        IdAuteur = m.IdUtilisateur,
        NomAuteur = m.Utilisateur?.Nom ?? "",
        PrenomAuteur = m.Utilisateur?.Prenom ?? ""
    };
}
