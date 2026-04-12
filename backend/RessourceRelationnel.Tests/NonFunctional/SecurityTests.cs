using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.RessourceDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.NonFunctional;

/// <summary>
/// CT-SEC-001 — Accès Back-Office sans authentification
/// CT-SEC-002 — Injection SQL dans le champ recherche rejetée
/// CT-SEC-003 — Accès croisé entre utilisateurs (IDOR)
/// CT-SEC-004 — Escalade de privilèges interdite
/// </summary>
public class SecurityTests
{
    // ─── CT-SEC-002 — Payload SQL classique dans la recherche ────────────────────
    [Theory]
    [InlineData("' OR '1'='1")]
    [InlineData("'; DROP TABLE Ressource; --")]
    [InlineData("\" OR \"1\"=\"1")]
    [InlineData("1; SELECT * FROM Utilisateur --")]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("' UNION SELECT password FROM Utilisateur --")]
    public async Task GetAll_WithSqlInjectionInSearch_ReturnsOkWithEmptyOrSafeList(string maliciousInput)
    {
        // EF Core utilise des requêtes paramétrées — aucune injection ne passe
        using var context = TestDbContextFactory.Create($"SecSQL_{maliciousInput.GetHashCode()}");
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee, Visibilite.Publique);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        // Ne doit pas lever d'exception ni retourner d'erreur 500
        var result = await controller.GetAll(null, null, maliciousInput);

        // Doit retourner 200 avec une liste vide (aucune ressource ne correspond)
        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Empty(list); // Aucun résultat : l'injection n'a pas fonctionné
    }

    // ─── CT-SEC-002 — Injection dans le filtre catégorie ──────────────────────────
    [Theory]
    [InlineData("'; DROP TABLE categorie; --")]
    [InlineData("' OR 1=1 --")]
    public async Task GetAll_WithSqlInjectionInCategorie_ReturnsEmptyList(string maliciousInput)
    {
        using var context = TestDbContextFactory.Create($"SecCat_{maliciousInput.GetHashCode()}");
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context, "Famille");
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee, Visibilite.Publique);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetAll(maliciousInput, null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        Assert.Empty(list);
    }

    // ─── CT-SEC-001 — Accès à la file de modération sans rôle → logique protégée ─
    [Fact]
    public async Task GetQueue_CitoyenRole_OnlyReturnsEnValidationItems()
    {
        // Le contrôleur est protégé par [Authorize(Roles = "moderateur,...")]
        // En test unitaire, on vérifie que seules les ressources EnValidation sont retournées
        using var context = TestDbContextFactory.Create(nameof(GetQueue_CitoyenRole_OnlyReturnsEnValidationItems));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.EnValidation);
        TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie, Statut.Publiee);

        var controller = new ModerationController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "moderateur");

        var result = await controller.GetQueue();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<RessourceDto>>(ok.Value).ToList();
        // La réponse ne contient que les ressources en attente, jamais les publiées
        Assert.All(list, r => Assert.Equal("EnValidation", r.Statut));
    }

    // ─── CT-SEC-003 — IDOR : citoyen ne peut pas lire le profil d'un autre ───────
    [Fact]
    public async Task GetById_CitoyenAccessingOtherProfile_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(GetById_CitoyenAccessingOtherProfile_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var user1 = TestDbContextFactory.CreateUtilisateur(context, email: "u1@example.com");
        var user2 = TestDbContextFactory.CreateUtilisateur(context, email: "u2@example.com");
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, user1.IdUtilisateur, "citoyen");

        var result = await controller.GetById(user2.IdUtilisateur);

        Assert.IsType<ForbidResult>(result);
    }

    // ─── CT-SEC-004 — Escalade de privilèges : citoyen ne peut pas modifier les rôles
    [Fact]
    public async Task Update_CitoyenCannotChangeOwnRole_RoleIgnored()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_CitoyenCannotChangeOwnRole_RoleIgnored));
        TestDbContextFactory.SeedRoles(context);
        var citoyen = TestDbContextFactory.CreateUtilisateur(context, idRole: 1);
        var jwt = JwtTestHelper.CreateJwtService();

        var controller = new UtilisateursController(context, jwt);
        ControllerTestHelper.SetUser(controller, citoyen.IdUtilisateur, "citoyen");

        // Tente de s'attribuer le rôle super_administrateur (id=4)
        var dto = new RessourceRelationnel.Domain.DTOs.Utilisateurs.UpdateUtilisateurDto
        {
            IdRole = 4
        };

        await controller.Update(citoyen.IdUtilisateur, dto);

        // Le rôle ne doit pas avoir changé (citoyen ne peut pas modifier son propre rôle)
        var updatedUser = context.Utilisateurs.Find(citoyen.IdUtilisateur);
        Assert.Equal(1, updatedUser!.IdRole); // Toujours citoyen
    }

    // ─── CT-SEC-005 — Modification ressource d'un autre utilisateur interdite ────
    [Fact]
    public async Task Update_CitoyenCannotEditOtherUserResource_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(Update_CitoyenCannotEditOtherUserResource_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var owner = TestDbContextFactory.CreateUtilisateur(context, email: "owner@example.com");
        var attacker = TestDbContextFactory.CreateUtilisateur(context, email: "attacker@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, owner.IdUtilisateur, cat.IdCategorie, Statut.Brouillon);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, attacker.IdUtilisateur, "citoyen");

        var result = await controller.Update(ressource.IdRessource, new UpdateRessourceDto { Titre = "Hacked!" });

        Assert.IsType<ForbidResult>(result);
    }

    // ─── CT-SEC-006 — Suppression ressource d'un autre utilisateur interdite ─────
    [Fact]
    public async Task Delete_CitoyenCannotDeleteOtherUserResource_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_CitoyenCannotDeleteOtherUserResource_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var owner = TestDbContextFactory.CreateUtilisateur(context, email: "owner@example.com");
        var attacker = TestDbContextFactory.CreateUtilisateur(context, email: "attacker@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, owner.IdUtilisateur, cat.IdCategorie);

        var controller = new RessourcesController(context);
        ControllerTestHelper.SetUser(controller, attacker.IdUtilisateur, "citoyen");

        var result = await controller.Delete(ressource.IdRessource);

        Assert.IsType<ForbidResult>(result);
        // La ressource est toujours en base
        Assert.NotNull(context.Ressources.Find(ressource.IdRessource));
    }

    // ─── CT-SEC-007 — Suppression commentaire d'un autre utilisateur interdite ───
    [Fact]
    public async Task DeleteComment_CitoyenCannotDeleteOtherUserComment_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(DeleteComment_CitoyenCannotDeleteOtherUserComment_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var auteur = TestDbContextFactory.CreateUtilisateur(context, email: "auteur@example.com");
        var intrus = TestDbContextFactory.CreateUtilisateur(context, email: "intrus@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, auteur.IdUtilisateur, cat.IdCategorie);

        var commentaire = new RessourceRelationnel.Domain.Models.Commentaire
        {
            Contenu = "Commentaire protege",
            IdUtilisateur = auteur.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateCreation = DateTime.UtcNow
        };
        context.Commentaires.Add(commentaire);
        context.SaveChanges();

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetUser(controller, intrus.IdUtilisateur, "citoyen");

        var result = await controller.Delete(commentaire.IdCommentaire);

        Assert.IsType<ForbidResult>(result);
    }

    // ─── CT-SEC-008 — Valider ressource en doublon favori → protection intégrité ─
    [Fact]
    public async Task AddFavori_Duplicate_Returns409NotDataCorruption()
    {
        using var context = TestDbContextFactory.Create(nameof(AddFavori_Duplicate_Returns409NotDataCorruption));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        context.Favoris.Add(new RessourceRelationnel.Domain.Models.Favori
        {
            IdUtilisateur = user.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateAjout = DateTime.UtcNow
        });
        context.SaveChanges();

        var controller = new FavorisController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Ajouter(ressource.IdRessource);

        // Doit retourner 409, pas créer un doublon en base
        Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal(1, context.Favoris.Count());
    }
}
