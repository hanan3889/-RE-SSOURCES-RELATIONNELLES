using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour RessourcesController
/// CT-RES-001 à CT-RES-012
/// </summary>
public class RessourcesControllerTests
{
    // ─── CT-RES-001 — Liste publique sans connexion ──────────────────────────────
    [Fact]
    public async Task GetAll_WithPublicResources_ReturnsOnlyPublished()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_WithPublicResources_ReturnsOnlyPublished));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee, Visibilite.Publique);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation, Visibilite.Publique);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee, Visibilite.Privee);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll(null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value);
        Assert.Single(list); // Seulement la publique publiée
    }

    // ─── CT-RES-002 — Filtrer par catégorie ─────────────────────────────────────
    [Fact]
    public async Task GetAll_FilterByCategorie_ReturnsMatchingOnly()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_FilterByCategorie_ReturnsMatchingOnly));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat1 = TestDbContextFactory.CreateCategorie(context, "Famille");
        var cat2 = TestDbContextFactory.CreateCategorie(context, "Travail");

        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat1.IdCategorie, Statut.Publiee, Visibilite.Publique);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat2.IdCategorie, Statut.Publiee, Visibilite.Publique);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll("Famille", null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Equal("Famille", list[0].NomCategorie);
    }

    // ─── CT-RES-003 — Tri par date (défaut) ──────────────────────────────────────
    [Fact]
    public async Task GetAll_SortByDate_ReturnsOrderedByDateDesc()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_SortByDate_ReturnsOrderedByDateDesc));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var r1 = new RessourceRelationnel.Domain.Models.Ressource
        {
            Titre = "Ancienne", Description = "d", Format = "article",
            Visibilite = Visibilite.Publique, Statut = Statut.Publiee,
            IdUtilisateur = user.IdUtilisateur, IdCategorie = cat.IdCategorie,
            DateCreation = DateTime.UtcNow.AddDays(-5)
        };
        var r2 = new RessourceRelationnel.Domain.Models.Ressource
        {
            Titre = "Récente", Description = "d", Format = "article",
            Visibilite = Visibilite.Publique, Statut = Statut.Publiee,
            IdUtilisateur = user.IdUtilisateur, IdCategorie = cat.IdCategorie,
            DateCreation = DateTime.UtcNow
        };
        context.Ressources.AddRange(r1, r2);
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll(null, null, null, "date");

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal("Récente", list[0].Titre);
    }

    // ─── Recherche texte ─────────────────────────────────────────────────────────
    [Fact]
    public async Task GetAll_SearchByKeyword_ReturnsMatchingTitles()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_SearchByKeyword_ReturnsMatchingTitles));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var r1 = new RessourceRelationnel.Domain.Models.Ressource
        {
            Titre = "Guide communication couple", Description = "d", Format = "article",
            Visibilite = Visibilite.Publique, Statut = Statut.Publiee,
            IdUtilisateur = user.IdUtilisateur, IdCategorie = cat.IdCategorie,
            DateCreation = DateTime.UtcNow
        };
        var r2 = new RessourceRelationnel.Domain.Models.Ressource
        {
            Titre = "Sport et bien-être", Description = "d", Format = "article",
            Visibilite = Visibilite.Publique, Statut = Statut.Publiee,
            IdUtilisateur = user.IdUtilisateur, IdCategorie = cat.IdCategorie,
            DateCreation = DateTime.UtcNow
        };
        context.Ressources.AddRange(r1, r2);
        context.SaveChanges();

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll(null, null, "couple");

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Single(list);
        Assert.Contains("couple", list[0].Titre.ToLower());
    }

    // ─── GET by ID — ressource publique ─────────────────────────────────────────
    [Fact]
    public async Task GetById_PublicPublishedResource_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create(nameof(GetById_PublicPublishedResource_ReturnsOk));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetById(ressource.IdRessource);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<RessourceDto>(ok.Value);
        Assert.Equal(ressource.IdRessource, dto.IdRessource);
    }

    // ─── GET by ID — introuvable ──────────────────────────────────────────────
    [Fact]
    public async Task GetById_NonExistentId_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(GetById_NonExistentId_ReturnsNotFound));
        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetById(9999);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── CT-RES-010 — Créer ressource privée ────────────────────────────────────
    [Fact]
    public async Task Create_AuthenticatedUser_CreatesResourceWithEnValidationStatus()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_AuthenticatedUser_CreatesResourceWithEnValidationStatus));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new CreateRessourceDto
        {
            Titre = "Ma ressource",
            Description = "Description",
            Format = "article",
            Visibilite = Visibilite.Privee,
            IdCategorie = cat.IdCategorie
        };

        var result = await controller.Create(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var ressourceDto = Assert.IsType<RessourceDto>(created.Value);
        Assert.Equal("EnValidation", ressourceDto.Statut);
        Assert.Equal("Ma ressource", ressourceDto.Titre);
    }

    // ─── CT-RES-011 — Ressource publique → En attente de validation ─────────────
    [Fact]
    public async Task Create_PublicResource_StatusIsEnValidation()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_PublicResource_StatusIsEnValidation));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new CreateRessourceDto
        {
            Titre = "Ressource publique",
            Description = "Description",
            Format = "video",
            Visibilite = Visibilite.Publique,
            IdCategorie = cat.IdCategorie
        };

        var result = await controller.Create(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var ressourceDto = Assert.IsType<RessourceDto>(created.Value);
        Assert.Equal("EnValidation", ressourceDto.Statut);
        Assert.Equal("Publique", ressourceDto.Visibilite);
    }

    // ─── CT-RES-012 — Éditer sa propre ressource (état Brouillon) ───────────────
    [Fact]
    public async Task Update_OwnerWithBrouillonResource_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_OwnerWithBrouillonResource_ReturnsOk));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Brouillon);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new UpdateRessourceDto { Titre = "Nouveau titre" };
        var result = await controller.Update(ressource.IdRessource, dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var updated = Assert.IsType<RessourceDto>(ok.Value);
        Assert.Equal("Nouveau titre", updated.Titre);
    }

    // ─── Éditer ressource publiée (citoyen non-admin) ────────────────────────────
    [Fact]
    public async Task Update_OwnerWithPublishedResource_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_OwnerWithPublishedResource_ReturnsBadRequest));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new UpdateRessourceDto { Titre = "Tentative modif" };
        var result = await controller.Update(ressource.IdRessource, dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ─── Admin peut modifier toute ressource ─────────────────────────────────────
    [Fact]
    public async Task Update_AdminCanEditAnyResource_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_AdminCanEditAnyResource_ReturnsOk));
        TestDbContextFactory.SeedRoles(context);
        var owner = TestDbContextFactory.CreateUtilisateur(context, email: "owner@example.com");
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, owner.IdUtilisateur, cat.IdCategorie, Statut.Publiee);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var dto = new UpdateRessourceDto { Titre = "Titre admin" };
        var result = await controller.Update(ressource.IdRessource, dto);

        Assert.IsType<OkObjectResult>(result);
    }

    // ─── Supprimer sa propre ressource ──────────────────────────────────────────
    [Fact]
    public async Task Delete_OwnResource_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_OwnResource_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Delete(ressource.IdRessource);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Ressources);
    }

    // ─── Supprimer la ressource d'un autre → interdit ───────────────────────────
    [Fact]
    public async Task Delete_OtherUserResource_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_OtherUserResource_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var owner = TestDbContextFactory.CreateUtilisateur(context, email: "owner@example.com");
        var other = TestDbContextFactory.CreateUtilisateur(context, email: "other@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, owner.IdUtilisateur, cat.IdCategorie);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, other.IdUtilisateur, "citoyen");

        var result = await controller.Delete(ressource.IdRessource);

        Assert.IsType<ForbidResult>(result);
    }

    // ─── Mes ressources — liste du citoyen connecté ──────────────────────────────
    [Fact]
    public async Task MesRessources_ReturnsOnlyUserResources()
    {
        using var context = TestDbContextFactory.Create(nameof(MesRessources_ReturnsOnlyUserResources));
        TestDbContextFactory.SeedRoles(context);
        var user1 = TestDbContextFactory.CreateUtilisateur(context, email: "user1@example.com");
        var user2 = TestDbContextFactory.CreateUtilisateur(context, email: "user2@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);

        TestDbContextFactory.CreateRessource(context, user1.IdUtilisateur, cat.IdCategorie);
        TestDbContextFactory.CreateRessource(context, user1.IdUtilisateur, cat.IdCategorie);
        TestDbContextFactory.CreateRessource(context, user2.IdUtilisateur, cat.IdCategorie);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user1.IdUtilisateur, "citoyen");

        var result = await controller.MesRessources();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Equal(2, list.Count);
        Assert.All(list, r => Assert.Equal(user1.IdUtilisateur, r.IdUtilisateur));
    }

    // ─── Catégorie invalide à la création ───────────────────────────────────────
    [Fact]
    public async Task Create_WithInvalidCategorie_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_WithInvalidCategorie_ReturnsBadRequest));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new CreateRessourceDto
        {
            Titre = "Test",
            Description = "Desc",
            Format = "article",
            Visibilite = Visibilite.Publique,
            IdCategorie = 9999 // Inexistante
        };

        var result = await controller.Create(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_ActivityFormat_ByCitizen_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_ActivityFormat_ByCitizen_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new CreateRessourceDto
        {
            Titre = "Atelier citoyen",
            Description = "Description",
            Format = "Activité",
            Visibilite = Visibilite.Publique,
            IdCategorie = cat.IdCategorie
        };

        var result = await controller.Create(dto);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Create_ActivityFormat_ByAdmin_ReturnsCreated()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_ActivityFormat_ByAdmin_ReturnsCreated));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin-activity@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var dto = new CreateRessourceDto
        {
            Titre = "Jeu de coopération",
            Description = "Description",
            Format = "Jeu",
            Visibilite = Visibilite.Publique,
            IdCategorie = cat.IdCategorie
        };

        var result = await controller.Create(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var ressourceDto = Assert.IsType<RessourceDto>(created.Value);
        Assert.Equal("Jeu", ressourceDto.Format);
    }
}
