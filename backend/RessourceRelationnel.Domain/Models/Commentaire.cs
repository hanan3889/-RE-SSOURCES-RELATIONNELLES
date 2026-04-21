namespace RessourceRelationnel.Domain.Models;

public class Commentaire
{
    public long IdCommentaire { get; set; }
    public string Contenu { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    public long? IdCommentaireParent { get; set; }
    public Commentaire? ParentCommentaire { get; set; }
    public ICollection<Commentaire> Reponses { get; set; } = new List<Commentaire>();

    public long IdUtilisateur { get; set; }
    public Utilisateur? Utilisateur { get; set; }

    public long IdRessource { get; set; }
    public Ressource? Ressource { get; set; }
}
