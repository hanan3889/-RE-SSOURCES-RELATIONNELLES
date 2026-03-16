namespace RessourceRelationnel.Domain.DTOs.Utilisateurs;

public class UtilisateurDto
{
    public long IdUtilisateur { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DateNaissance { get; set; }
    public string? Adresse { get; set; }
    public string? Ville { get; set; }
    public string? CodePostal { get; set; }
    public string? Pays { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsActive { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public long IdRole { get; set; }
    public string? NomRole { get; set; }
}
