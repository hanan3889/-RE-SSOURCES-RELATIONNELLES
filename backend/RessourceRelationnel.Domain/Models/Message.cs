namespace RessourceRelationnel.Domain.Models;

public class Message
{
    public long IdMessage { get; set; }
    public DateTime DateCreation { get; set; }
    public string Contenu { get; set; } = string.Empty;

    public long IdUtilisateur { get; set; }
    public Utilisateur? Utilisateur { get; set; }
}
