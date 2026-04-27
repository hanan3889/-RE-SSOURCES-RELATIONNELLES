using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;
using Xunit.Abstractions;

namespace RessourceRelationnel.Tests.NonFunctional;

/// <summary>
/// CT-PERF-001 — Chargement liste ressources < 3 secondes (SLA 3000ms)
/// CT-PERF-002 — Résultat filtrage/recherche < 2 secondes (SLA 2000ms)
/// </summary>
public class PerformanceTests
{
    private readonly ITestOutputHelper _output;

    // Seuils définis dans le cahier des charges
    private const int SLA_LIST_MS = 3000;   // CT-PERF-001 : < 3s
    private const int SLA_SEARCH_MS = 2000; // CT-PERF-002 : < 2s

    public PerformanceTests(ITestOutputHelper output)
    {
        _output = output;
    }

    // ─── CT-PERF-001 — Chargement liste avec 100 ressources < 3s ─────────────────
    [Fact]
    public async Task GetAll_With100Resources_RespondsUnder3Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_With100Resources_RespondsUnder3Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        // Seed 100 ressources publiées publiques
        for (int i = 0; i < 100; i++)
        {
            context.Ressources.Add(new Ressource
            {
                Titre = $"Ressource {i}",
                Description = $"Description de la ressource numero {i}",
                Format = "article",
                Visibilite = Visibilite.Publique,
                Statut = Statut.Publiee,
                IdUtilisateur = user.IdUtilisateur,
                IdCategorie = cat.IdCategorie,
                DateCreation = DateTime.UtcNow.AddDays(-i)
            });
        }
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var sw = Stopwatch.StartNew();
        var result = await controller.GetAll(null, null, null);
        sw.Stop();

        _output.WriteLine($"[CT-PERF-001] GetAll(100 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_LIST_MS} ms)");

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(100, list.Count);
        Assert.True(sw.ElapsedMilliseconds < SLA_LIST_MS,
            $"PERF: GetAll a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_LIST_MS}ms");
    }

    // ─── CT-PERF-001 — Chargement liste avec 500 ressources < 3s ─────────────────
    [Fact]
    public async Task GetAll_With500Resources_RespondsUnder3Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_With500Resources_RespondsUnder3Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var ressources = Enumerable.Range(0, 500).Select(i => new Ressource
        {
            Titre = $"Ressource {i}",
            Description = $"Description {i}",
            Format = "article",
            Visibilite = Visibilite.Publique,
            Statut = Statut.Publiee,
            IdUtilisateur = user.IdUtilisateur,
            IdCategorie = cat.IdCategorie,
            DateCreation = DateTime.UtcNow.AddSeconds(-i)
        }).ToList();
        context.Ressources.AddRange(ressources);
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var sw = Stopwatch.StartNew();
        var result = await controller.GetAll(null, null, null);
        sw.Stop();

        _output.WriteLine($"[CT-PERF-001] GetAll(500 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_LIST_MS} ms)");

        Assert.IsType<OkObjectResult>(result);
        Assert.True(sw.ElapsedMilliseconds < SLA_LIST_MS,
            $"PERF: GetAll(500) a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_LIST_MS}ms");
    }

    // ─── CT-PERF-002 — Recherche textuelle sur 100 ressources < 2s ───────────────
    [Fact]
    public async Task GetAll_SearchOn100Resources_RespondsUnder2Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_SearchOn100Resources_RespondsUnder2Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        for (int i = 0; i < 100; i++)
        {
            context.Ressources.Add(new Ressource
            {
                Titre = i % 10 == 0 ? $"Guide communication {i}" : $"Autre ressource {i}",
                Description = "Description",
                Format = "article",
                Visibilite = Visibilite.Publique,
                Statut = Statut.Publiee,
                IdUtilisateur = user.IdUtilisateur,
                IdCategorie = cat.IdCategorie,
                DateCreation = DateTime.UtcNow
            });
        }
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var sw = Stopwatch.StartNew();
        var result = await controller.GetAll(null, null, "communication");
        sw.Stop();

        _output.WriteLine($"[CT-PERF-002] Recherche 'communication' (100 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_SEARCH_MS} ms)");

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(10, list.Count); // 10 ressources sur 100 matchent
        Assert.True(sw.ElapsedMilliseconds < SLA_SEARCH_MS,
            $"PERF: Recherche a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_SEARCH_MS}ms");
    }

    // ─── CT-PERF-002 — Filtre par catégorie sur 200 ressources < 2s ──────────────
    [Fact]
    public async Task GetAll_FilterByCategorieOn200Resources_RespondsUnder2Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_FilterByCategorieOn200Resources_RespondsUnder2Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat1 = TestDbContextFactory.CreateCategorie(context, "Couple");
        var cat2 = TestDbContextFactory.CreateCategorie(context, "Famille");

        for (int i = 0; i < 200; i++)
        {
            context.Ressources.Add(new Ressource
            {
                Titre = $"Ressource {i}",
                Description = "Description",
                Format = "article",
                Visibilite = Visibilite.Publique,
                Statut = Statut.Publiee,
                IdUtilisateur = user.IdUtilisateur,
                IdCategorie = i % 2 == 0 ? cat1.IdCategorie : cat2.IdCategorie,
                DateCreation = DateTime.UtcNow
            });
        }
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var sw = Stopwatch.StartNew();
        var result = await controller.GetAll("Couple", null, null);
        sw.Stop();

        _output.WriteLine($"[CT-PERF-002] Filtre catégorie 'Couple' (200 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_SEARCH_MS} ms)");

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(100, list.Count);
        Assert.True(sw.ElapsedMilliseconds < SLA_SEARCH_MS,
            $"PERF: Filtre catégorie a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_SEARCH_MS}ms");
    }

    // ─── CT-PERF-002 — File de modération sur 50 ressources < 2s ─────────────────
    [Fact]
    public async Task GetQueue_With50PendingResources_RespondsUnder2Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetQueue_With50PendingResources_RespondsUnder2Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        for (int i = 0; i < 50; i++)
        {
            context.Ressources.Add(new Ressource
            {
                Titre = $"Ressource en attente {i}",
                Description = "En attente de validation",
                Format = "article",
                Visibilite = Visibilite.Publique,
                Statut = Statut.EnValidation,
                IdUtilisateur = user.IdUtilisateur,
                IdCategorie = cat.IdCategorie,
                DateCreation = DateTime.UtcNow.AddMinutes(-i)
            });
        }
        context.SaveChanges();

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var sw = Stopwatch.StartNew();
        var result = await controller.GetQueue();
        sw.Stop();

        _output.WriteLine($"[CT-PERF-002] File modération (50 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_SEARCH_MS} ms)");

        Assert.IsType<OkObjectResult>(result);
        Assert.True(sw.ElapsedMilliseconds < SLA_SEARCH_MS,
            $"PERF: File modération a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_SEARCH_MS}ms");
    }

    // ─── CT-PERF — Dashboard progression < 2s ────────────────────────────────────
    [Fact]
    public async Task GetDashboard_WithManyResources_RespondsUnder2Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(GetDashboard_WithManyResources_RespondsUnder2Seconds));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        for (int i = 0; i < 50; i++)
        {
            var r = new Ressource
            {
                Titre = $"Ressource {i}",
                Description = "Description",
                Format = "article",
                Visibilite = Visibilite.Publique,
                Statut = i % 2 == 0 ? Statut.Publiee : Statut.EnValidation,
                IdUtilisateur = user.IdUtilisateur,
                IdCategorie = cat.IdCategorie,
                DateCreation = DateTime.UtcNow
            };
            context.Ressources.Add(r);
        }
        context.SaveChanges();

        var controller = new ProgressionController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var sw = Stopwatch.StartNew();
        var result = await controller.GetDashboard();
        sw.Stop();

        _output.WriteLine($"[CT-PERF] Dashboard progression (50 ressources) : {sw.ElapsedMilliseconds} ms (SLA={SLA_SEARCH_MS} ms)");

        Assert.IsType<OkObjectResult>(result);
        Assert.True(sw.ElapsedMilliseconds < SLA_SEARCH_MS,
            $"PERF: Dashboard a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_SEARCH_MS}ms");
    }

    // ─── CT-PERF — Authentification (login) < 3s ─────────────────────────────────
    [Fact]
    public async Task Login_HashVerification_CompletesUnder3Seconds()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_HashVerification_CompletesUnder3Seconds));
        TestDbContextFactory.SeedRoles(context);
        TestDbContextFactory.CreateUtilisateur(context, email: "perf@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new AuthController(context, jwt);

        var sw = Stopwatch.StartNew();
        var result = await controller.Login(new RessourceRelationnel.Domain.DTOs.AuthDto.LoginDto
        {
            Email = "perf@example.com",
            Password = "Password@123"
        });
        sw.Stop();

        _output.WriteLine($"[CT-PERF] Login (BCrypt verify) : {sw.ElapsedMilliseconds} ms (SLA={SLA_LIST_MS} ms)");

        Assert.IsType<OkObjectResult>(result);
        Assert.True(sw.ElapsedMilliseconds < SLA_LIST_MS,
            $"PERF: Login a pris {sw.ElapsedMilliseconds}ms > SLA {SLA_LIST_MS}ms");
    }
}
