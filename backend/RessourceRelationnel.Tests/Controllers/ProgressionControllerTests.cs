using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour ProgressionController
/// CT-PRO-001 à CT-PRO-003
/// </summary>
public class ProgressionControllerTests
{
    // ─── CT-PRO-003 — Tableau de bord vide ───────────────────────────────────────
    [Fact]
    public async Task GetDashboard_NewUser_ReturnsZeroCounts()
    {
        using var context = TestDbContextFactory.Create(nameof(GetDashboard_NewUser_ReturnsZeroCounts));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);

        var controller = new ProgressionController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.GetDashboard();

        var ok = Assert.IsType<OkObjectResult>(result);
        dynamic value = ok.Value!;
        Assert.Equal(0, (int)value.GetType().GetProperty("nbFavoris")!.GetValue(value));
        Assert.Equal(0, (int)value.GetType().GetProperty("nbMesRessources")!.GetValue(value));
        Assert.Equal(0, (int)value.GetType().GetProperty("nbPubliees")!.GetValue(value));
        Assert.Equal(0, (int)value.GetType().GetProperty("nbEnAttente")!.GetValue(value));
    }

    // ─── CT-PRO-003 — Tableau de bord avec données ───────────────────────────────
    [Fact]
    public async Task GetDashboard_UserWithResources_ReturnsCorrectCounts()
    {
        using var context = TestDbContextFactory.Create(nameof(GetDashboard_UserWithResources_ReturnsCorrectCounts));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        // 2 publiées, 1 en attente
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);

        var controller = new ProgressionController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.GetDashboard();

        var ok = Assert.IsType<OkObjectResult>(result);
        dynamic value = ok.Value!;
        Assert.Equal(3, (int)value.GetType().GetProperty("nbMesRessources")!.GetValue(value));
        Assert.Equal(2, (int)value.GetType().GetProperty("nbPubliees")!.GetValue(value));
        Assert.Equal(1, (int)value.GetType().GetProperty("nbEnAttente")!.GetValue(value));
    }

    // ─── CT-PRO-001 — Marquer comme favori ───────────────────────────────────────
    [Fact]
    public async Task GetDashboard_WithFavoris_CountsCorrectly()
    {
        using var context = TestDbContextFactory.Create(nameof(GetDashboard_WithFavoris_CountsCorrectly));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        // Ajouter un favori manuellement
        context.Favoris.Add(new Favori
        {
            IdUtilisateur = user.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateAjout = DateTime.UtcNow
        });
        context.SaveChanges();

        var controller = new ProgressionController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.GetDashboard();

        var ok = Assert.IsType<OkObjectResult>(result);
        dynamic value = ok.Value!;
        Assert.Equal(1, (int)value.GetType().GetProperty("nbFavoris")!.GetValue(value));
    }

    // ─── Dashboard isolé par utilisateur ─────────────────────────────────────────
    [Fact]
    public async Task GetDashboard_OnlyCountsCurrentUserData()
    {
        using var context = TestDbContextFactory.Create(nameof(GetDashboard_OnlyCountsCurrentUserData));
        TestDbContextFactory.SeedRoles(context);
        var user1 = TestDbContextFactory.CreateUtilisateur(context, email: "u1@example.com");
        var user2 = TestDbContextFactory.CreateUtilisateur(context, email: "u2@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);

        TestDbContextFactory.CreateRessource(context, user1.IdUtilisateur, cat.IdCategorie, Statut.Publiee);
        TestDbContextFactory.CreateRessource(context, user2.IdUtilisateur, cat.IdCategorie, Statut.Publiee);
        TestDbContextFactory.CreateRessource(context, user2.IdUtilisateur, cat.IdCategorie, Statut.Publiee);

        var controller = new ProgressionController(context);
        ControllerTestHelper.SetUser(controller, user1.IdUtilisateur, "citoyen");

        var result = await controller.GetDashboard();

        var ok = Assert.IsType<OkObjectResult>(result);
        dynamic value = ok.Value!;
        Assert.Equal(1, (int)value.GetType().GetProperty("nbMesRessources")!.GetValue(value));
    }
}
