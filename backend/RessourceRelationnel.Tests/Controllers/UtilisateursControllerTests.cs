using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour UtilisateursController
/// CT-ADM-001 à CT-ADM-005, CT-SADM-001 à CT-SADM-003
/// </summary>
public class UtilisateursControllerTests
{
    // ─── CT-ADM-004 — Désactiver un compte citoyen ───────────────────────────────
    [Fact]
    public async Task ToggleStatut_Deactivate_SetsIsActiveFalse()
    {
        using var context = TestDbContextFactory.Create(nameof(ToggleStatut_Deactivate_SetsIsActiveFalse));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        var citoyen = TestDbContextFactory.CreateUtilisateur(context, email: "citoyen@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var result = await controller.ToggleStatut(citoyen.IdUtilisateur, false);

        Assert.IsType<NoContentResult>(result);
        var updated = context.Utilisateurs.Find(citoyen.IdUtilisateur);
        Assert.False(updated!.IsActive);
    }

    // ─── CT-ADM-005 — Réactiver un compte citoyen ────────────────────────────────
    [Fact]
    public async Task ToggleStatut_Reactivate_SetsIsActiveTrue()
    {
        using var context = TestDbContextFactory.Create(nameof(ToggleStatut_Reactivate_SetsIsActiveTrue));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        var citoyen = TestDbContextFactory.CreateUtilisateur(context, email: "citoyen@example.com", isActive: false);
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var result = await controller.ToggleStatut(citoyen.IdUtilisateur, true);

        Assert.IsType<NoContentResult>(result);
        var updated = context.Utilisateurs.Find(citoyen.IdUtilisateur);
        Assert.True(updated!.IsActive);
    }

    // ─── ToggleStatut — utilisateur inexistant → 404 ─────────────────────────────
    [Fact]
    public async Task ToggleStatut_NonExistentUser_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(ToggleStatut_NonExistentUser_ReturnsNotFound));
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, 1, "administrateur");

        var result = await controller.ToggleStatut(9999, false);

        Assert.IsType<NotFoundResult>(result);
    }

    // ─── CT-SADM-001/002 — Créer un compte modérateur / administrateur ───────────
    [Theory]
    [InlineData(2, "moderateur")]
    [InlineData(3, "administrateur")]
    public async Task CreatePrivilegedUser_BySupAdmin_ReturnsCreated(long roleId, string roleName)
    {
        using var context = TestDbContextFactory.Create($"CreatePriv_{roleName}");
        TestDbContextFactory.SeedRoles(context);
        var sadm = TestDbContextFactory.CreateUtilisateur(context, idRole: 4, email: "sadm@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, sadm.IdUtilisateur, "super_administrateur");

        var dto = new CreatePrivilegedUserDto
        {
            Nom = "Moderateur",
            Prenom = "Test",
            Email = $"{roleName}@example.com",
            Password = "Password@123",
            IdRole = roleId
        };

        var result = await controller.CreatePrivilegedUser(dto);

        Assert.IsType<CreatedResult>(result);
        Assert.True(context.Utilisateurs.Any(u => u.Email == dto.Email));
    }

    // ─── CT-SADM-002 — Email déjà utilisé pour compte privilégié ───────────────
    [Fact]
    public async Task CreatePrivilegedUser_DuplicateEmail_ReturnsConflict()
    {
        using var context = TestDbContextFactory.Create(nameof(CreatePrivilegedUser_DuplicateEmail_ReturnsConflict));
        TestDbContextFactory.SeedRoles(context);
        var sadm = TestDbContextFactory.CreateUtilisateur(context, idRole: 4, email: "sadm@example.com");
        TestDbContextFactory.CreateUtilisateur(context, idRole: 2, email: "mod@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, sadm.IdUtilisateur, "super_administrateur");

        var dto = new CreatePrivilegedUserDto
        {
            Nom = "Dup", Prenom = "User", Email = "mod@example.com",
            Password = "Password@123", IdRole = 2
        };

        var result = await controller.CreatePrivilegedUser(dto);

        Assert.IsType<ConflictObjectResult>(result);
    }

    // ─── Créer compte avec rôle invalide ─────────────────────────────────────────
    [Fact]
    public async Task CreatePrivilegedUser_InvalidRole_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create(nameof(CreatePrivilegedUser_InvalidRole_ReturnsBadRequest));
        TestDbContextFactory.SeedRoles(context);
        var sadm = TestDbContextFactory.CreateUtilisateur(context, idRole: 4, email: "sadm@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, sadm.IdUtilisateur, "super_administrateur");

        var dto = new CreatePrivilegedUserDto
        {
            Nom = "Test", Prenom = "User", Email = "new@example.com",
            Password = "Password@123", IdRole = 9999
        };

        var result = await controller.CreatePrivilegedUser(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ─── Admin : liste tous les utilisateurs ─────────────────────────────────────
    [Fact]
    public async Task GetAll_AdminRole_ReturnsAllUsers()
    {
        using var context = TestDbContextFactory.Create(nameof(GetAll_AdminRole_ReturnsAllUsers));
        TestDbContextFactory.SeedRoles(context);
        var admin = TestDbContextFactory.CreateUtilisateur(context, idRole: 3, email: "admin@example.com");
        TestDbContextFactory.CreateUtilisateur(context, email: "c1@example.com");
        TestDbContextFactory.CreateUtilisateur(context, email: "c2@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, admin.IdUtilisateur, "administrateur");

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value).ToList();
        Assert.Equal(3, users.Count);
    }

    // ─── CT-SADM-003 — Citoyen ne peut pas accéder à GetAll ──────────────────────
    [Fact]
    public async Task GetById_OtherUser_CitoyenForbidden()
    {
        using var context = TestDbContextFactory.Create(nameof(GetById_OtherUser_CitoyenForbidden));
        TestDbContextFactory.SeedRoles(context);
        var u1 = TestDbContextFactory.CreateUtilisateur(context, email: "u1@example.com");
        var u2 = TestDbContextFactory.CreateUtilisateur(context, email: "u2@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, u1.IdUtilisateur, "citoyen");

        var result = await controller.GetById(u2.IdUtilisateur);

        Assert.IsType<ForbidResult>(result);
    }

    // ─── Suppression par super_admin ─────────────────────────────────────────────
    [Fact]
    public async Task Delete_BySuperAdmin_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_BySuperAdmin_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var sadm = TestDbContextFactory.CreateUtilisateur(context, idRole: 4, email: "sadm@example.com");
        var citoyen = TestDbContextFactory.CreateUtilisateur(context, email: "citoyen@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, sadm.IdUtilisateur, "super_administrateur");

        var result = await controller.Delete(citoyen.IdUtilisateur);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(context.Utilisateurs.Find(citoyen.IdUtilisateur));
    }
}
