namespace RessourceRelationnel.Domain.DTOs.Utilisateurs;

public class CreateUtilisateurDto
{
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public long IdRole { get; set; }
}
