using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour FavorisController
/// CT-PRO-001 — Marquer une ressource comme favori
/// CT-PRO-002 — Retirer des favoris
/// </summary>
public class FavorisControllerTests
{
    // ─── CT-PRO-001 — Ajouter aux favoris ────────────────────────────────────────
    [Fact]
    public async Task Ajouter_ValidResource_ReturnsCreated()
    {
        using var context = TestDbContextFactory.Create(nameof(Ajouter_ValidResource_ReturnsCreated));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Ajouter(ressource.IdRessource);

        Assert.IsType<CreatedResult>(result);
        Assert.Equal(1, context.Favoris.Count());
    }

    // ─── Ajouter doublon → conflit ────────────────────────────────────────────────
    [Fact]
    public async Task Ajouter_AlreadyFavorited_ReturnsConflict()
    {
        using var context = TestDbContextFactory.Create(nameof(Ajouter_AlreadyFavorited_ReturnsConflict));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        context.Favoris.Add(new Favori
        {
            IdUtilisateur = user.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateAjout = DateTime.UtcNow
        });
        context.SaveChanges();

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Ajouter(ressource.IdRessource);

        Assert.IsType<ConflictObjectResult>(result);
    }

    // ─── Ressource inexistante → 404 ─────────────────────────────────────────────
    [Fact]
    public async Task Ajouter_NonExistentResource_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Ajouter_NonExistentResource_ReturnsNotFound));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Ajouter(9999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    // ─── CT-PRO-002 — Retirer des favoris ────────────────────────────────────────
    [Fact]
    public async Task Retirer_ExistingFavori_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Retirer_ExistingFavori_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        context.Favoris.Add(new Favori
        {
            IdUtilisateur = user.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateAjout = DateTime.UtcNow
        });
        context.SaveChanges();

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Retirer(ressource.IdRessource);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Favoris);
    }

    // ─── Retirer favori inexistant → 404 ─────────────────────────────────────────
    [Fact]
    public async Task Retirer_NonExistentFavori_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Retirer_NonExistentFavori_ReturnsNotFound));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Retirer(ressource.IdRessource);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    // ─── Liste des favoris du citoyen ────────────────────────────────────────────
    [Fact]
    public async Task MesFavoris_ReturnsOnlyCurrentUserFavoris()
    {
        using var context = TestDbContextFactory.Create(nameof(MesFavoris_ReturnsOnlyCurrentUserFavoris));
        TestDbContextFactory.SeedRoles(context);
        var u1 = TestDbContextFactory.CreateUtilisateur(context, email: "u1@example.com");
        var u2 = TestDbContextFactory.CreateUtilisateur(context, email: "u2@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var r1 = TestDbContextFactory.CreateRessource(context, u1.IdUtilisateur, cat.IdCategorie);
        var r2 = TestDbContextFactory.CreateRessource(context, u1.IdUtilisateur, cat.IdCategorie);
        var r3 = TestDbContextFactory.CreateRessource(context, u1.IdUtilisateur, cat.IdCategorie);

        context.Favoris.AddRange(
            new Favori { IdUtilisateur = u1.IdUtilisateur, IdRessource = r1.IdRessource, DateAjout = DateTime.UtcNow },
            new Favori { IdUtilisateur = u1.IdUtilisateur, IdRessource = r2.IdRessource, DateAjout = DateTime.UtcNow },
            new Favori { IdUtilisateur = u2.IdUtilisateur, IdRessource = r3.IdRessource, DateAjout = DateTime.UtcNow }
        );
        context.SaveChanges();

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, u1.IdUtilisateur, "citoyen");

        var result = await controller.MesFavoris();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(2, list.Count);
    }
}
