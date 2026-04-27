using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.CategorieDto;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour CategoriesController
/// CT-ADM-001 à CT-ADM-003
/// </summary>
public class CategoriesControllerTests
{
    // ─── CT-ADM-001 — Ajouter une catégorie ──────────────────────────────────────
    [Fact]
    public async Task Create_ValidCategorie_ReturnsCreated()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_ValidCategorie_ReturnsCreated));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");

        var controller = new CategoriesController(context);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var dto = new CreateCategorieDto { NomCategorie = "Couple" };
        var result = await controller.Create(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var cat = Assert.IsType<CategorieDto>(created.Value);
        Assert.Equal("Couple", cat.NomCategorie);
    }

    // ─── Lister les catégories (public) ──────────────────────────────────────────
    [Fact]
    public async Task GetAll_ReturnsAllCategories()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_ReturnsAllCategories));
        TestDbContextFactory.CreateCategorie(context, "Famille");
        TestDbContextFactory.CreateCategorie(context, "Travail");
        TestDbContextFactory.CreateCategorie(context, "Amis");

        var controller = new CategoriesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<CategorieDto>>(ok.Value).ToList();
        Assert.Equal(3, list.Count);
    }

    // ─── CT-ADM-002 — Éditer une catégorie ───────────────────────────────────────
    [Fact]
    public async Task Update_ExistingCategorie_ReturnsUpdated()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_ExistingCategorie_ReturnsUpdated));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context, "Ancien nom");

        var controller = new CategoriesController(context);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var dto = new CreateCategorieDto { NomCategorie = "Nouveau nom" };
        var result = await controller.Update(cat.IdCategorie, dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var updated = Assert.IsType<CategorieDto>(ok.Value);
        Assert.Equal("Nouveau nom", updated.NomCategorie);
    }

    // ─── CT-ADM-003 — Supprimer une catégorie ────────────────────────────────────
    [Fact]
    public async Task Delete_ExistingCategorie_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_ExistingCategorie_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context, "A supprimer");

        var controller = new CategoriesController(context);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var result = await controller.Delete(cat.IdCategorie);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Categories);
    }

    // ─── Mettre à jour catégorie inexistante → 404 ───────────────────────────────
    [Fact]
    public async Task Update_NonExistentCategorie_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_NonExistentCategorie_ReturnsNotFound));
        var controller = new CategoriesController(context);
        ControllerTestHelper.SetUser(controller, 1, "administrateur");

        var result = await controller.Update(9999, new CreateCategorieDto { NomCategorie = "Test" });

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── Supprimer catégorie inexistante → 404 ───────────────────────────────────
    [Fact]
    public async Task Delete_NonExistentCategorie_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_NonExistentCategorie_ReturnsNotFound));
        var controller = new CategoriesController(context);
        ControllerTestHelper.SetUser(controller, 1, "administrateur");

        var result = await controller.Delete(9999);

        Assert.IsType<NotFoundResult>(result);
    }
}
