namespace RessourceRelationnel.Domain.Models;

public class Ressource
{
    public long IdRessource { get; set; }
    public string Titre { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public Visibilite Visibilite { get; set; }
    public Statut Statut { get; set; } = Statut.EnValidation;
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    public long IdUtilisateur { get; set; }
    public Utilisateur? Utilisateur { get; set; }

    public long IdCategorie { get; set; }
    public Categorie? Categorie { get; set; }

    public ICollection<Favori> Favoris { get; set; } = new List<Favori>();
    public ICollection<Commentaire> Commentaires { get; set; } = new List<Commentaire>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
