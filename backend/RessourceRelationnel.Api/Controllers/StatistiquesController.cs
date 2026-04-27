using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/admin/statistiques")]
[Authorize(Roles = "administrateur,super_administrateur")]
public class StatistiquesController : ControllerBase
{
    private readonly RRDbContext _context;
    private const string ExploiteeSuffix = ":exploitee";
    private const string SauvegardeeSuffix = ":saved";
    private const string DemarreeSuffix = ":started";

    public StatistiquesController(RRDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateTime? dateDebut,
        [FromQuery] DateTime? dateFin,
        [FromQuery] string? categorie,
        [FromQuery] string? format,
        [FromQuery] string? visibilite)
    {
        var response = await BuildStatistics(dateDebut, dateFin, categorie, format, visibilite);
        return Ok(response);
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] DateTime? dateDebut,
        [FromQuery] DateTime? dateFin,
        [FromQuery] string? categorie,
        [FromQuery] string? format,
        [FromQuery] string? visibilite)
    {
        var response = await BuildStatistics(dateDebut, dateFin, categorie, format, visibilite);

        var builder = new StringBuilder();
        builder.AppendLine("indicateur,valeur");
        builder.AppendLine($"ressources_total,{response.Resume.TotalRessources}");
        builder.AppendLine($"ressources_publiees,{response.Resume.RessourcesPubliees}");
        builder.AppendLine($"ressources_en_validation,{response.Resume.RessourcesEnValidation}");
        builder.AppendLine($"ressources_archivees,{response.Resume.RessourcesArchivees}");
        builder.AppendLine($"comptes_total,{response.Resume.TotalUtilisateurs}");
        builder.AppendLine($"comptes_actifs,{response.Resume.UtilisateursActifs}");
        builder.AppendLine($"comptes_crees_periode,{response.Resume.ComptesCreesPeriode}");
        builder.AppendLine($"favoris,{response.Resume.Favoris}");
        builder.AppendLine($"commentaires,{response.Resume.Commentaires}");
        builder.AppendLine($"exploitations,{response.Resume.Exploitations}");
        builder.AppendLine($"sauvegardes,{response.Resume.Sauvegardes}");
        builder.AppendLine($"activites_demarrees,{response.Resume.ActivitesDemarrees}");
        builder.AppendLine($"invitations_envoyees,{response.Resume.InvitationsEnvoyees}");
        builder.AppendLine($"invitations_acceptees,{response.Resume.InvitationsAcceptees}");
        builder.AppendLine($"messages_discussion,{response.Resume.MessagesDiscussion}");
        builder.AppendLine();
        builder.AppendLine("repartition_type,label,valeur");

        foreach (var item in response.CreationsParCategorie)
            builder.AppendLine($"creations_par_categorie,{EscapeCsv(item.Label)},{item.Value}");

        foreach (var item in response.CreationsParFormat)
            builder.AppendLine($"creations_par_format,{EscapeCsv(item.Label)},{item.Value}");

        foreach (var item in response.RepartitionVisibilite)
            builder.AppendLine($"repartition_visibilite,{EscapeCsv(item.Label)},{item.Value}");

        var fileName = $"statistiques_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", fileName);
    }

    private async Task<StatisticsResponse> BuildStatistics(
        DateTime? dateDebut,
        DateTime? dateFin,
        string? categorie,
        string? format,
        string? visibilite)
    {
        var start = dateDebut?.Date;
        var endExclusive = dateFin?.Date.AddDays(1);

        var resourcesQuery = _context.Ressources
            .AsNoTracking()
            .Include(r => r.Categorie)
            .AsQueryable();

        if (start.HasValue)
            resourcesQuery = resourcesQuery.Where(r => r.DateCreation >= start.Value);
        if (endExclusive.HasValue)
            resourcesQuery = resourcesQuery.Where(r => r.DateCreation < endExclusive.Value);
        if (!string.IsNullOrWhiteSpace(categorie))
            resourcesQuery = resourcesQuery.Where(r => r.Categorie != null && r.Categorie.NomCategorie == categorie);
        if (!string.IsNullOrWhiteSpace(format))
            resourcesQuery = resourcesQuery.Where(r => r.Format == format);
        if (!string.IsNullOrWhiteSpace(visibilite) && Enum.TryParse<Visibilite>(visibilite, true, out var visibiliteEnum))
            resourcesQuery = resourcesQuery.Where(r => r.Visibilite == visibiliteEnum);

        var resourceSnapshot = await resourcesQuery
            .Select(r => new { r.IdRessource, r.Statut, r.Format, r.Visibilite, Category = r.Categorie != null ? r.Categorie.NomCategorie : "Sans catégorie" })
            .ToListAsync();

        var resourceIds = resourceSnapshot.Select(r => r.IdRessource).ToList();

        var favorisQuery = _context.Favoris.AsNoTracking().Where(f => resourceIds.Contains(f.IdRessource));
        var commentairesQuery = _context.Commentaires.AsNoTracking().Where(c => resourceIds.Contains(c.IdRessource));
        var messagesQuery = _context.Messages.AsNoTracking().Where(m => m.IdRessource.HasValue && resourceIds.Contains(m.IdRessource.Value));

        var exploitationsQuery = _context.Progressions.AsNoTracking().Where(p => p.Valeur.EndsWith(ExploiteeSuffix));
        var sauvegardesQuery = _context.Progressions.AsNoTracking().Where(p => p.Valeur.EndsWith(SauvegardeeSuffix));
        var demarragesQuery = _context.Progressions.AsNoTracking().Where(p => p.Valeur.EndsWith(DemarreeSuffix));

        var exploitationKeys = resourceIds.Select(id => $"ressource:{id}{ExploiteeSuffix}").ToList();
        var sauvegardeKeys = resourceIds.Select(id => $"ressource:{id}{SauvegardeeSuffix}").ToList();
        var demarrageKeys = resourceIds.Select(id => $"ressource:{id}{DemarreeSuffix}").ToList();

        if (resourceIds.Count > 0)
        {
            exploitationsQuery = exploitationsQuery.Where(p => exploitationKeys.Contains(p.Valeur));
            sauvegardesQuery = sauvegardesQuery.Where(p => sauvegardeKeys.Contains(p.Valeur));
            demarragesQuery = demarragesQuery.Where(p => demarrageKeys.Contains(p.Valeur));
        }
        else
        {
            exploitationsQuery = exploitationsQuery.Where(_ => false);
            sauvegardesQuery = sauvegardesQuery.Where(_ => false);
            demarragesQuery = demarragesQuery.Where(_ => false);
        }

        var totalUsers = await _context.Utilisateurs.AsNoTracking().CountAsync();
        var activeUsers = await _context.Utilisateurs.AsNoTracking().CountAsync(u => u.IsActive);

        var createdUsersQuery = _context.Utilisateurs.AsNoTracking().AsQueryable();
        if (start.HasValue)
            createdUsersQuery = createdUsersQuery.Where(u => u.CreatedAt >= start.Value);
        if (endExclusive.HasValue)
            createdUsersQuery = createdUsersQuery.Where(u => u.CreatedAt < endExclusive.Value);

        return new StatisticsResponse
        {
            Resume = new StatisticsSummary
            {
                TotalRessources = resourceSnapshot.Count,
                RessourcesPubliees = resourceSnapshot.Count(r => r.Statut == Statut.Publiee),
                RessourcesEnValidation = resourceSnapshot.Count(r => r.Statut == Statut.EnValidation),
                RessourcesArchivees = resourceSnapshot.Count(r => r.Statut == Statut.Archivee),
                TotalUtilisateurs = totalUsers,
                UtilisateursActifs = activeUsers,
                ComptesCreesPeriode = await createdUsersQuery.CountAsync(),
                Favoris = await favorisQuery.CountAsync(),
                Commentaires = await commentairesQuery.CountAsync(),
                Exploitations = await exploitationsQuery.CountAsync(),
                Sauvegardes = await sauvegardesQuery.CountAsync(),
                ActivitesDemarrees = await demarragesQuery.CountAsync(),
                InvitationsEnvoyees = await messagesQuery.CountAsync(m => m.TypeMessage == "invitation"),
                InvitationsAcceptees = await messagesQuery.CountAsync(m => m.TypeMessage == "invitation" && m.StatutInvitation == "accepted"),
                MessagesDiscussion = await messagesQuery.CountAsync(m => m.TypeMessage == "discussion")
            },
            CreationsParCategorie = resourceSnapshot
                .GroupBy(r => r.Category)
                .Select(g => new BreakdownItem { Label = g.Key, Value = g.Count() })
                .OrderByDescending(g => g.Value)
                .ToList(),
            CreationsParFormat = resourceSnapshot
                .GroupBy(r => r.Format)
                .Select(g => new BreakdownItem { Label = g.Key, Value = g.Count() })
                .OrderByDescending(g => g.Value)
                .ToList(),
            RepartitionVisibilite = resourceSnapshot
                .GroupBy(r => r.Visibilite.ToString())
                .Select(g => new BreakdownItem { Label = g.Key, Value = g.Count() })
                .OrderByDescending(g => g.Value)
                .ToList(),
            Filtres = new StatisticsFilters
            {
                DateDebut = start,
                DateFin = dateFin?.Date,
                Categorie = categorie,
                Format = format,
                Visibilite = visibilite
            }
        };
    }

    private static string EscapeCsv(string value)
    {
        var safe = value.Replace("\"", "\"\"");
        return $"\"{safe}\"";
    }

    public sealed class StatisticsResponse
    {
        public StatisticsSummary Resume { get; set; } = new();
        public List<BreakdownItem> CreationsParCategorie { get; set; } = new();
        public List<BreakdownItem> CreationsParFormat { get; set; } = new();
        public List<BreakdownItem> RepartitionVisibilite { get; set; } = new();
        public StatisticsFilters Filtres { get; set; } = new();
    }

    public sealed class StatisticsSummary
    {
        public int TotalRessources { get; set; }
        public int RessourcesPubliees { get; set; }
        public int RessourcesEnValidation { get; set; }
        public int RessourcesArchivees { get; set; }
        public int TotalUtilisateurs { get; set; }
        public int UtilisateursActifs { get; set; }
        public int ComptesCreesPeriode { get; set; }
        public int Favoris { get; set; }
        public int Commentaires { get; set; }
        public int Exploitations { get; set; }
        public int Sauvegardes { get; set; }
        public int ActivitesDemarrees { get; set; }
        public int InvitationsEnvoyees { get; set; }
        public int InvitationsAcceptees { get; set; }
        public int MessagesDiscussion { get; set; }
    }

    public sealed class BreakdownItem
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
    }

    public sealed class StatisticsFilters
    {
        public DateTime? DateDebut { get; set; }
        public DateTime? DateFin { get; set; }
        public string? Categorie { get; set; }
        public string? Format { get; set; }
        public string? Visibilite { get; set; }
    }
}