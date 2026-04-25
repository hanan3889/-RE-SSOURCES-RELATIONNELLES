namespace RessourceRelationnel.Domain.Models;

public class Message
{
    public long IdMessage { get; set; }
    public DateTime DateCreation { get; set; }
    public string Contenu { get; set; } = string.Empty;
    public string TypeMessage { get; set; } = "direct";
    public string? StatutInvitation { get; set; }

    public long IdUtilisateur { get; set; }
    public Utilisateur? Auteur { get; set; }

    public long? IdDestinataire { get; set; }
    public Utilisateur? Destinataire { get; set; }

    public long? IdRessource { get; set; }
    public Ressource? Ressource { get; set; }
}
