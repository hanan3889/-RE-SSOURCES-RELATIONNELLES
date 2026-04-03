namespace RessourceRelationnel.Domain.DTOs.RessourceDto;

public class RessourceDto
{
    public long IdRessource { get; set; }
    public string Titre { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public string Visibilite { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
    public long IdUtilisateur { get; set; }
    public string NomAuteur { get; set; } = string.Empty;
    public string PrenomAuteur { get; set; } = string.Empty;
    public long IdCategorie { get; set; }
    public string NomCategorie { get; set; } = string.Empty;
}
