using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Tests.Helpers;

public static class TestDbContextFactory
{
    public static RRDbContext Create(string dbName)
    {
        var options = new DbContextOptionsBuilder<RRDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new RRDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static void SeedRoles(RRDbContext context)
    {
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { IdRole = 1, NomRole = "citoyen" },
                new Role { IdRole = 2, NomRole = "moderateur" },
                new Role { IdRole = 3, NomRole = "administrateur" },
                new Role { IdRole = 4, NomRole = "super_administrateur" }
            );
            context.SaveChanges();
        }
    }

    public static Utilisateur CreateUtilisateur(RRDbContext context, long idRole = 1, string email = "test@example.com", bool isActive = true)
    {
        var user = new Utilisateur
        {
            Nom = "Test",
            Prenom = "User",
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword("Password@123"),
            IdRole = idRole,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Utilisateurs.Add(user);
        context.SaveChanges();
        return user;
    }

    public static Categorie CreateCategorie(RRDbContext context, string nom = "Famille")
    {
        var cat = new Categorie { NomCategorie = nom };
        context.Categories.Add(cat);
        context.SaveChanges();
        return cat;
    }

    public static Ressource CreateRessource(RRDbContext context, long idUtilisateur, long idCategorie, Statut statut = Statut.Publiee, Visibilite visibilite = Visibilite.Publique)
    {
        var r = new Ressource
        {
            Titre = "Ressource Test",
            Description = "Description test",
            Format = "article",
            Visibilite = visibilite,
            Statut = statut,
            IdUtilisateur = idUtilisateur,
            IdCategorie = idCategorie,
            DateCreation = DateTime.UtcNow
        };
        context.Ressources.Add(r);
        context.SaveChanges();
        return r;
    }
}
