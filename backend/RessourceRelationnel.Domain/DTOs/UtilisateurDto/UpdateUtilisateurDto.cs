namespace RessourceRelationnel.Domain.DTOs.Utilisateurs;

public class UpdateUtilisateurDto
{
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Bio { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DateNaissance { get; set; }
    public string? Adresse { get; set; }
    public string? Ville { get; set; }
    public string? CodePostal { get; set; }
    public string? Pays { get; set; }
    public string? PhotoUrl { get; set; }
    public long? IdRole { get; set; }
    public bool? IsActive { get; set; }
}
