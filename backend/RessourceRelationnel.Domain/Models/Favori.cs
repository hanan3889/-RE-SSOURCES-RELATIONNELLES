namespace RessourceRelationnel.Domain.Models;

public class Favori
{
    public long IdUtilisateur { get; set; }
    public Utilisateur? Utilisateur { get; set; }

    public long IdRessource { get; set; }
    public Ressource? Ressource { get; set; }

    public DateTime DateAjout { get; set; } = DateTime.UtcNow;
}
