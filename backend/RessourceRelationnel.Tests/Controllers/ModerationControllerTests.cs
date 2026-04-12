using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour ModerationController
/// CT-MOD-001 à CT-MOD-004
/// </summary>
public class ModerationControllerTests
{
    // ─── CT-MOD-001 — Voir les ressources en attente ─────────────────────────────
    [Fact]
    public async Task GetQueue_ReturnsOnlyEnValidationResources()
    {
        using var context = TestDbContextFactory.Create(nameof(GetQueue_ReturnsOnlyEnValidationResources));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Rejetee);

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var result = await controller.GetQueue();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(2, list.Count);
        Assert.All(list, r => Assert.Equal("EnValidation", r.Statut));
    }

    // ─── CT-MOD-002 — Valider une ressource → publication ────────────────────────
    [Fact]
    public async Task Valider_ExistingResource_ChangesStatusToPubliee()
    {
        using var context = TestDbContextFactory.Create(nameof(Valider_ExistingResource_ChangesStatusToPubliee));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var result = await controller.Valider(ressource.IdRessource);

        Assert.IsType<NoContentResult>(result);
        var updated = context.Ressources.Find(ressource.IdRessource);
        Assert.Equal(Statut.Publiee, updated!.Statut);
    }

    // ─── CT-MOD-003 — Rejeter une ressource ──────────────────────────────────────
    [Fact]
    public async Task Refuser_ExistingResource_ChangesStatusToRejetee()
    {
        using var context = TestDbContextFactory.Create(nameof(Refuser_ExistingResource_ChangesStatusToRejetee));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var result = await controller.Refuser(ressource.IdRessource);

        Assert.IsType<NoContentResult>(result);
        var updated = context.Ressources.Find(ressource.IdRessource);
        Assert.Equal(Statut.Rejetee, updated!.Statut);
    }

    // ─── Valider ressource inexistante → 404 ─────────────────────────────────────
    [Fact]
    public async Task Valider_NonExistentResource_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Valider_NonExistentResource_ReturnsNotFound));
        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, 1, "moderateur");

        var result = await controller.Valider(9999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Refuser ressource inexistante → 404 ─────────────────────────────────────
    [Fact]
    public async Task Refuser_NonExistentResource_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Refuser_NonExistentResource_ReturnsNotFound));
        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, 1, "moderateur");

        var result = await controller.Refuser(9999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── File vide si aucune ressource en attente ─────────────────────────────────
    [Fact]
    public async Task GetQueue_NoPendingResources_ReturnsEmptyList()
    {
        using var context = TestDbContextFactory.Create(nameof(GetQueue_NoPendingResources_ReturnsEmptyList));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var result = await controller.GetQueue();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Empty(list);
    }
}
