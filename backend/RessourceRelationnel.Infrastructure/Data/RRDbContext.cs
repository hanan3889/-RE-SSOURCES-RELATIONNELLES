using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.Models;
using System.Data;

namespace RessourceRelationnel.Infrastructure.Data;

public class RRDbContext : DbContext
{
    public RRDbContext(DbContextOptions<RRDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();
    public DbSet<Categorie> Categories => Set<Categorie>();
    public DbSet<Ressource> Ressources => Set<Ressource>();
    public DbSet<Progression> Progressions => Set<Progression>();
    public DbSet<Statistique> Statistiques => Set<Statistique>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ROLE
        modelBuilder.Entity<Role>()
            .ToTable("role")
            .HasKey(r => r.IdRole);

        modelBuilder.Entity<Role>()
            .Property(r => r.NomRole)
            .HasColumnName("nom_role")
            .HasMaxLength(255)
            .IsRequired();

        // UTILISATEUR
        modelBuilder.Entity<Utilisateur>()
            .ToTable("Utilisateur")
            .HasKey(u => u.IdUtilisateur);

        modelBuilder.Entity<Utilisateur>()
            .Property(u => u.Nom).HasColumnName("nom").HasMaxLength(255).IsRequired();
        modelBuilder.Entity<Utilisateur>()
            .Property(u => u.Prenom).HasColumnName("prenom").HasMaxLength(255).IsRequired();
        modelBuilder.Entity<Utilisateur>()
            .Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        modelBuilder.Entity<Utilisateur>()
            .Property(u => u.Password).HasColumnName("password").HasMaxLength(255).IsRequired();

        modelBuilder.Entity<Utilisateur>()
            .Property(u => u.IdRole).HasColumnName("id_role").IsRequired();

        modelBuilder.Entity<Utilisateur>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Utilisateurs)
            .HasForeignKey(u => u.IdRole);

        // CATEGORIE
        modelBuilder.Entity<Categorie>()
            .ToTable("categorie")
            .HasKey(c => c.IdCategorie);

        modelBuilder.Entity<Categorie>()
            .Property(c => c.NomCategorie)
            .HasColumnName("nom_categorie")
            .HasMaxLength(255)
            .IsRequired();

        // RESSOURCE
        modelBuilder.Entity<Ressource>()
            .ToTable("Ressource")
            .HasKey(r => r.IdRessource);

        modelBuilder.Entity<Ressource>()
            .Property(r => r.Titre).HasColumnName("titre").HasMaxLength(255).IsRequired();
        modelBuilder.Entity<Ressource>()
            .Property(r => r.Description).HasColumnName("description").HasMaxLength(255).IsRequired();
        modelBuilder.Entity<Ressource>()
            .Property(r => r.Format).HasColumnName("format").HasMaxLength(255).IsRequired();

        modelBuilder.Entity<Ressource>()
            .Property(r => r.IdUtilisateur).HasColumnName("id_utilisateur").IsRequired();
        modelBuilder.Entity<Ressource>()
            .Property(r => r.IdCategorie).HasColumnName("id_categorie").IsRequired();

        modelBuilder.Entity<Ressource>()
            .HasOne(r => r.Utilisateur)
            .WithMany(u => u.Ressources)
            .HasForeignKey(r => r.IdUtilisateur);

        modelBuilder.Entity<Ressource>()
            .HasOne(r => r.Categorie)
            .WithMany(c => c.Ressources)
            .HasForeignKey(r => r.IdCategorie);

        // PROGRESSION
        modelBuilder.Entity<Progression>()
            .ToTable("progression")
            .HasKey(p => p.IdProgression);

        modelBuilder.Entity<Progression>()
            .Property(p => p.Valeur)
            .HasColumnName("progression")
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Progression>()
            .Property(p => p.IdUtilisateur)
            .HasColumnName("id_utilisateur")
            .IsRequired();

        modelBuilder.Entity<Progression>()
            .HasOne(p => p.Utilisateur)
            .WithMany(u => u.Progressions)
            .HasForeignKey(p => p.IdUtilisateur);

        // STATISTIQUE
        modelBuilder.Entity<Statistique>()
            .ToTable("Statistique")
            .HasKey(s => s.IdStatistique);

        modelBuilder.Entity<Statistique>()
            .Property(s => s.Valeur)
            .HasColumnName("statistique")
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Statistique>()
            .Property(s => s.IdUtilisateur)
            .HasColumnName("id_utilisateur")
            .IsRequired();

        modelBuilder.Entity<Statistique>()
            .HasOne(s => s.Utilisateur)
            .WithMany(u => u.Statistiques)
            .HasForeignKey(s => s.IdUtilisateur);

        // MESSAGE
        modelBuilder.Entity<Message>()
            .ToTable("Message")
            .HasKey(m => m.IdMessage);

        modelBuilder.Entity<Message>()
            .Property(m => m.DateCreation)
            .HasColumnName("date_creation")
            .IsRequired();

        modelBuilder.Entity<Message>()
            .Property(m => m.Contenu)
            .HasColumnName("contenu")
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Message>()
            .Property(m => m.IdUtilisateur)
            .HasColumnName("id_utilisateur")
            .IsRequired();

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Utilisateur)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.IdUtilisateur);
    }
}
