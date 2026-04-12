using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.CommentaireDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour CommentairesController
/// CT-MOD-004 — Suppression de commentaire
/// </summary>
public class CommentairesControllerTests
{
    // ─── Lister commentaires d'une ressource ─────────────────────────────────────
    [Fact]
    public async Task GetByRessource_ExistingResource_ReturnsComments()
    {
        using var context = TestDbContextFactory.Create(nameof(GetByRessource_ExistingResource_ReturnsComments));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        context.Commentaires.AddRange(
            new Commentaire { Contenu = "Super ressource !", IdUtilisateur = user.IdUtilisateur, IdRessource = ressource.IdRessource, DateCreation = DateTime.UtcNow },
            new Commentaire { Contenu = "Merci !", IdUtilisateur = user.IdUtilisateur, IdRessource = ressource.IdRessource, DateCreation = DateTime.UtcNow }
        );
        context.SaveChanges();

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetByRessource(ressource.IdRessource);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IEnumerable<CommentaireDto>>(ok.Value).ToList();
        Assert.Equal(2, list.Count);
    }

    // ─── Ressource inexistante → 404 ─────────────────────────────────────────────
    [Fact]
    public async Task GetByRessource_NonExistentResource_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create(nameof(GetByRessource_NonExistentResource_ReturnsNotFound));
        var controller = new CommentairesController(context);
        ControllerTestHelper.SetAnonymousUser(controller);

        var result = await controller.GetByRessource(9999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    // ─── Créer un commentaire ────────────────────────────────────────────────────
    [Fact]
    public async Task Create_AuthenticatedUser_ReturnsCreated()
    {
        using var context = TestDbContextFactory.Create(nameof(Create_AuthenticatedUser_ReturnsCreated));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var dto = new CreateCommentaireDto { Contenu = "Mon commentaire" };
        var result = await controller.Create(ressource.IdRessource, dto);

        var created = Assert.IsType<CreatedResult>(result);
        var commentaire = Assert.IsType<CommentaireDto>(created.Value);
        Assert.Equal("Mon commentaire", commentaire.Contenu);
    }

    // ─── CT-MOD-004 — Modérateur supprime un commentaire ─────────────────────────
    [Fact]
    public async Task Delete_ByModerator_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_ByModerator_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var auteur = TestDbContextFactory.CreateUtilisateur(context, email: "auteur@example.com");
        var modo = TestDbContextFactory.CreateUtilisateur(context, idRole: 2, email: "modo@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, auteur.IdUtilisateur, cat.IdCategorie);

        var commentaire = new Commentaire
        {
            Contenu = "Commentaire inapproprié",
            IdUtilisateur = auteur.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateCreation = DateTime.UtcNow
        };
        context.Commentaires.Add(commentaire);
        context.SaveChanges();

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetUser(controller, modo.IdUtilisateur, "moderateur");

        var result = await controller.Delete(commentaire.IdCommentaire);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Commentaires);
    }

    // ─── Auteur supprime son propre commentaire ───────────────────────────────────
    [Fact]
    public async Task Delete_ByAuthor_ReturnsNoContent()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_ByAuthor_ReturnsNoContent));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context);
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, user.IdUtilisateur, cat.IdCategorie);

        var commentaire = new Commentaire
        {
            Contenu = "Mon commentaire",
            IdUtilisateur = user.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateCreation = DateTime.UtcNow
        };
        context.Commentaires.Add(commentaire);
        context.SaveChanges();

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetUser(controller, user.IdUtilisateur, "citoyen");

        var result = await controller.Delete(commentaire.IdCommentaire);

        Assert.IsType<NoContentResult>(result);
    }

    // ─── Supprimer commentaire d'un autre → interdit ────────────────────────────
    [Fact]
    public async Task Delete_OtherUserComment_ReturnsForbid()
    {
        using var context = TestDbContextFactory.Create(nameof(Delete_OtherUserComment_ReturnsForbid));
        TestDbContextFactory.SeedRoles(context);
        var auteur = TestDbContextFactory.CreateUtilisateur(context, email: "auteur@example.com");
        var autre = TestDbContextFactory.CreateUtilisateur(context, email: "autre@example.com");
        var cat = TestDbContextFactory.CreateCategorie(context);
        var ressource = TestDbContextFactory.CreateRessource(context, auteur.IdUtilisateur, cat.IdCategorie);

        var commentaire = new Commentaire
        {
            Contenu = "Commentaire",
            IdUtilisateur = auteur.IdUtilisateur,
            IdRessource = ressource.IdRessource,
            DateCreation = DateTime.UtcNow
        };
        context.Commentaires.Add(commentaire);
        context.SaveChanges();

        var controller = new CommentairesController(context);
        ControllerTestHelper.SetUser(controller, autre.IdUtilisateur, "citoyen");

        var result = await controller.Delete(commentaire.IdCommentaire);

        Assert.IsType<ForbidResult>(result);
    }
}
