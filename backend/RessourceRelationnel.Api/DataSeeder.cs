using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api;

public static class DataSeeder
{
    public static async Task SeedAsync(RRDbContext db)
    {
        // --- Catégories ---
        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Categorie { NomCategorie = "Communication" },
                new Categorie { NomCategorie = "Gestion des émotions" },
                new Categorie { NomCategorie = "Leadership" },
                new Categorie { NomCategorie = "Résolution de conflits" },
                new Categorie { NomCategorie = "Intelligence émotionnelle" },
                new Categorie { NomCategorie = "Travail d'équipe" }
            );
            await db.SaveChangesAsync();
        }

        // --- Ressources (uniquement si aucune n'existe) ---
        if (!await db.Ressources.AnyAsync())
        {
            // Récupérer les catégories depuis la BDD
            var cats = await db.Categories.ToDictionaryAsync(c => c.NomCategorie, c => c.IdCategorie);

            // Utilisateur système — créé s'il n'existe pas
            const string systemEmail = "system@ressources-relationnelles.fr";
            var systemUser = await db.Utilisateurs.FirstOrDefaultAsync(u => u.Email == systemEmail);
            if (systemUser == null)
            {
                systemUser = new Utilisateur
                {
                    Nom = "Système",
                    Prenom = "RR",
                    Email = systemEmail,
                    Password = BCrypt.Net.BCrypt.HashPassword("SystemPass@2026!"),
                    IdRole = 4, // super_administrateur
                    IsActive = true,
                    IsEmailVerified = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                };
                db.Utilisateurs.Add(systemUser);
                await db.SaveChangesAsync();
            }

            long authorId = systemUser.IdUtilisateur;

            long comm = cats.GetValueOrDefault("Communication");
            long emot = cats.GetValueOrDefault("Gestion des émotions");
            long lead = cats.GetValueOrDefault("Leadership");
            long conf = cats.GetValueOrDefault("Résolution de conflits");
            long intel = cats.GetValueOrDefault("Intelligence émotionnelle");
            long team = cats.GetValueOrDefault("Travail d'équipe");

            var now = DateTime.UtcNow;

            db.Ressources.AddRange(
                new Ressource
                {
                    Titre = "L'écoute active : la clé d'une communication réussie",
                    Description = "Découvrez les techniques d'écoute active pour améliorer vos échanges quotidiens. Cette ressource vous guide pas à pas vers une communication plus empathique et efficace.",
                    Format = "Article",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = comm,
                    DateCreation = now.AddDays(-30)
                },
                new Ressource
                {
                    Titre = "Gérer le stress au travail : méthodes pratiques",
                    Description = "Un guide complet pour identifier les sources de stress professionnel et appliquer des techniques de relaxation et de gestion émotionnelle immédiatement applicables.",
                    Format = "PDF",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = emot,
                    DateCreation = now.AddDays(-25)
                },
                new Ressource
                {
                    Titre = "Développer son leadership naturel",
                    Description = "Ce module vidéo explore les différents styles de leadership et vous aide à identifier et cultiver votre propre style pour mieux motiver et fédérer votre équipe.",
                    Format = "Vidéo",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = lead,
                    DateCreation = now.AddDays(-20)
                },
                new Ressource
                {
                    Titre = "Résoudre les conflits sans perdants",
                    Description = "Apprenez la méthode de médiation en 5 étapes pour transformer les conflits en opportunités de collaboration. Exercices pratiques inclus.",
                    Format = "Article",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = conf,
                    DateCreation = now.AddDays(-18)
                },
                new Ressource
                {
                    Titre = "Intelligence émotionnelle : comprendre et maîtriser ses émotions",
                    Description = "Un parcours complet pour développer votre quotient émotionnel (QE). Vous apprendrez à reconnaître, comprendre et réguler vos émotions dans différentes situations.",
                    Format = "PDF",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = intel,
                    DateCreation = now.AddDays(-15)
                },
                new Ressource
                {
                    Titre = "Construire une équipe performante",
                    Description = "Guide pratique pour les managers souhaitant renforcer la cohésion d'équipe, favoriser la collaboration et créer un environnement de travail épanouissant.",
                    Format = "Vidéo",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = team,
                    DateCreation = now.AddDays(-12)
                },
                new Ressource
                {
                    Titre = "La CNV : Communication NonViolente au quotidien",
                    Description = "Introduction à la Communication NonViolente de Marshall Rosenberg. Apprenez à exprimer vos besoins et à recevoir ceux des autres avec bienveillance.",
                    Format = "Article",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = comm,
                    DateCreation = now.AddDays(-10)
                },
                new Ressource
                {
                    Titre = "Méditation pleine conscience pour professionnels",
                    Description = "Séances audio guidées de méditation mindfulness adaptées aux professionnels. 10 minutes par jour pour réduire le stress et améliorer la concentration.",
                    Format = "Audio",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = emot,
                    DateCreation = now.AddDays(-8)
                },
                new Ressource
                {
                    Titre = "Donner et recevoir du feedback constructif",
                    Description = "Techniques et outils pour formuler des retours constructifs et les recevoir sans se sentir attaqué. Un incontournable pour la dynamique d'équipe.",
                    Format = "PDF",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = team,
                    DateCreation = now.AddDays(-5)
                },
                new Ressource
                {
                    Titre = "Assertivité : s'affirmer avec respect",
                    Description = "Découvrez comment vous affirmer dans vos relations professionnelles et personnelles tout en respectant les autres. Exercices pratiques et mises en situation.",
                    Format = "Vidéo",
                    Visibilite = Visibilite.Publique,
                    Statut = Statut.Publiee,
                    IdUtilisateur = authorId,
                    IdCategorie = comm,
                    DateCreation = now.AddDays(-3)
                }
            );
            await db.SaveChangesAsync();
        }
    }
}
