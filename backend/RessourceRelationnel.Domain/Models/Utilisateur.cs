namespace RessourceRelationnel.Domain.Models;

public class Utilisateur
{
    public long IdUtilisateur { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    // Profil
    public string? Bio { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DateNaissance { get; set; }
    public string? Adresse { get; set; }
    public string? Ville { get; set; }
    public string? CodePostal { get; set; }
    public string? Pays { get; set; }
    public string? PhotoUrl { get; set; }

    // Statut
    public bool IsActive { get; set; } = true;
    public bool IsEmailVerified { get; set; } = false;

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public long IdRole { get; set; }
    public Role? Role { get; set; }

    public ICollection<Ressource> Ressources { get; set; } = new List<Ressource>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Progression> Progressions { get; set; } = new List<Progression>();
    public ICollection<Statistique> Statistiques { get; set; } = new List<Statistique>();
}
