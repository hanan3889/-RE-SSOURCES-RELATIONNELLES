namespace RessourceRelationnel.Domain.Models;

public class Categorie
{
    public long IdCategorie { get; set; }
    public string NomCategorie { get; set; } = string.Empty;

    public ICollection<Ressource> Ressources { get; set; } = new List<Ressource>();
}
