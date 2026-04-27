namespace RessourceRelationnel.Domain.DTOs.Utilisateurs;

public class UpdateUtilisateurDto
{
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public long? IdRole { get; set; }
    public bool? IsActive { get; set; }
}
