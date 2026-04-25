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
    private const string InvitationType = "invitation";
    private const string DiscussionType = "discussion";
    private const string PendingStatus = "pending";
    private const string AcceptedStatus = "accepted";
    private const string RefusedStatus = "refused";

    public MessagesController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/messages — historique utilisateur (compat)
    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messages = await _context.Messages
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .Where(m => m.IdUtilisateur == userId || m.IdDestinataire == userId)
            .OrderByDescending(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    // GET /api/messages/inbox — messages recus (invitation + direct)
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var messages = await _context.Messages
            .AsNoTracking()
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .Where(m => m.IdDestinataire == userId)
            .OrderByDescending(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    // GET /api/messages/ressources/{ressourceId}/discussion
    [HttpGet("ressources/{ressourceId:long}/discussion")]
    public async Task<IActionResult> GetDiscussion(long ressourceId)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!await CanAccessDiscussion(userId, ressourceId))
            return Forbid();

        var messages = await _context.Messages
            .AsNoTracking()
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .Where(m => m.IdRessource == ressourceId && m.TypeMessage == DiscussionType)
            .OrderBy(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    // POST /api/messages/ressources/{ressourceId}/inviter
    [HttpPost("ressources/{ressourceId:long}/inviter")]
    public async Task<IActionResult> InviterParticipant(long ressourceId, [FromBody] InviteParticipantDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ressource = await _context.Ressources
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.IdRessource == ressourceId);
        if (ressource == null)
            return NotFound(new { message = "Ressource introuvable." });

        var target = await ResolveTargetUser(dto.Cible);
        if (target == null)
            return NotFound(new { message = "Utilisateur introuvable." });

        if (target.IdUtilisateur == userId)
            return BadRequest(new { message = "Vous ne pouvez pas vous inviter vous-meme." });

        var pendingExists = await _context.Messages.AnyAsync(m =>
            m.TypeMessage == InvitationType
            && m.IdRessource == ressourceId
            && m.IdDestinataire == target.IdUtilisateur
            && m.StatutInvitation == PendingStatus);

        if (pendingExists)
            return Conflict(new { message = "Une invitation en attente existe deja pour cet utilisateur." });

        var invitation = new Message
        {
            IdUtilisateur = userId,
            IdDestinataire = target.IdUtilisateur,
            IdRessource = ressourceId,
            TypeMessage = InvitationType,
            StatutInvitation = PendingStatus,
            Contenu = string.IsNullOrWhiteSpace(dto.Message)
                ? $"Invitation a participer a la ressource '{ressource.Titre}'."
                : dto.Message.Trim(),
            DateCreation = DateTime.UtcNow
        };

        _context.Messages.Add(invitation);
        await _context.SaveChangesAsync();

        await _context.Entry(invitation).Reference(m => m.Auteur).LoadAsync();
        await _context.Entry(invitation).Reference(m => m.Destinataire).LoadAsync();
        await _context.Entry(invitation).Reference(m => m.Ressource).LoadAsync();

        return Created("", ToDto(invitation));
    }

    // PUT /api/messages/{id}/invitation
    [HttpPut("{id:long}/invitation")]
    public async Task<IActionResult> SetInvitationStatus(long id, [FromBody] SetInvitationStatusDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var invitation = await _context.Messages
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .FirstOrDefaultAsync(m => m.IdMessage == id && m.TypeMessage == InvitationType);

        if (invitation == null)
            return NotFound();

        if (invitation.IdDestinataire != userId)
            return Forbid();

        invitation.StatutInvitation = dto.Acceptee ? AcceptedStatus : RefusedStatus;
        await _context.SaveChangesAsync();

        return Ok(ToDto(invitation));
    }

    // POST /api/messages/ressources/{ressourceId}/discussion
    [HttpPost("ressources/{ressourceId:long}/discussion")]
    public async Task<IActionResult> CreateDiscussionMessage(long ressourceId, [FromBody] CreateDiscussionMessageDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!await CanAccessDiscussion(userId, ressourceId))
            return Forbid();

        if (string.IsNullOrWhiteSpace(dto.Contenu))
            return BadRequest(new { message = "Le message est requis." });

        var message = new Message
        {
            IdUtilisateur = userId,
            IdRessource = ressourceId,
            TypeMessage = DiscussionType,
            Contenu = dto.Contenu.Trim(),
            DateCreation = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        await _context.Entry(message).Reference(m => m.Auteur).LoadAsync();
        await _context.Entry(message).Reference(m => m.Ressource).LoadAsync();

        return Created("", ToDto(message));
    }

    // GET /api/messages/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var message = await _context.Messages
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .FirstOrDefaultAsync(m => m.IdMessage == id);

        if (message == null) return NotFound();

        bool isAdmin = role == "administrateur" || role == "super_administrateur";
        if (message.IdUtilisateur != userId && message.IdDestinataire != userId && !isAdmin) return Forbid();

        return Ok(ToDto(message));
    }

    // POST /api/messages
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMessageDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (string.IsNullOrWhiteSpace(dto.Cible))
            return BadRequest(new { message = "Cible requise. Utilisez 'prenom nom'." });

        if (string.IsNullOrWhiteSpace(dto.Contenu))
            return BadRequest(new { message = "Le message est requis." });

        var target = await ResolveTargetUser(dto.Cible);
        if (target == null)
            return NotFound(new { message = "Destinataire introuvable. Utilisez le format 'prenom nom'." });

        if (target.IdUtilisateur == userId)
            return BadRequest(new { message = "Vous ne pouvez pas vous envoyer un message a vous-meme." });

        var message = new Message
        {
            Contenu = dto.Contenu.Trim(),
            IdUtilisateur = userId,
            IdDestinataire = target.IdUtilisateur,
            TypeMessage = "direct",
            DateCreation = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        await _context.Entry(message).Reference(m => m.Auteur).LoadAsync();
        await _context.Entry(message).Reference(m => m.Destinataire).LoadAsync();

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
        if (message.IdUtilisateur != userId && message.IdDestinataire != userId && !isAdmin) return Forbid();

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
            .Include(m => m.Auteur)
            .Include(m => m.Destinataire)
            .Include(m => m.Ressource)
            .OrderByDescending(m => m.DateCreation)
            .Select(m => ToDto(m))
            .ToListAsync();

        return Ok(messages);
    }

    private async Task<bool> CanAccessDiscussion(long userId, long ressourceId)
    {
        var isOwner = await _context.Ressources.AnyAsync(r => r.IdRessource == ressourceId && r.IdUtilisateur == userId);
        if (isOwner)
            return true;

        var hasAcceptedInvitation = await _context.Messages.AnyAsync(m =>
            m.TypeMessage == InvitationType
            && m.IdRessource == ressourceId
            && m.IdDestinataire == userId
            && m.StatutInvitation == AcceptedStatus);

        return hasAcceptedInvitation;
    }

    private async Task<Utilisateur?> ResolveTargetUser(string value)
    {
        var normalized = NormalizeTarget(value);
        if (string.IsNullOrWhiteSpace(normalized))
            return null;

        var parts = normalized
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Messaging targets use first+last names only, not numeric ids.
        if (parts.Length < 2)
            return null;

        var first = parts[0];
        var rest = string.Join(' ', parts.Skip(1));

        var byPrenomNom = await _context.Utilisateurs
            .FirstOrDefaultAsync(u => u.Prenom.ToLower() == first.ToLower() && u.Nom.ToLower() == rest.ToLower());

        if (byPrenomNom != null)
            return byPrenomNom;

        return await _context.Utilisateurs
            .FirstOrDefaultAsync(u => u.Nom.ToLower() == first.ToLower() && u.Prenom.ToLower() == rest.ToLower());
    }

    private static string NormalizeTarget(string value)
    {
        var normalized = (value ?? string.Empty).Trim();
        if (normalized.StartsWith("@"))
            normalized = normalized[1..];

        return normalized;
    }

    private static MessageDto ToDto(Message m) => new()
    {
        IdMessage = m.IdMessage,
        Contenu = m.Contenu,
        DateCreation = m.DateCreation,
        TypeMessage = m.TypeMessage,
        StatutInvitation = m.StatutInvitation,
        IdRessource = m.IdRessource,
        TitreRessource = m.Ressource?.Titre,
        IdAuteur = m.IdUtilisateur,
        NomAuteur = m.Auteur?.Nom ?? "",
        PrenomAuteur = m.Auteur?.Prenom ?? "",
        IdDestinataire = m.IdDestinataire,
        NomDestinataire = m.Destinataire?.Nom,
        PrenomDestinataire = m.Destinataire?.Prenom
    };
}
