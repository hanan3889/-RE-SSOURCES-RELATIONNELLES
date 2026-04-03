using RessourceRelationnel.Domain.Models;

namespace RessourceRelationnel.Domain.DTOs.RessourceDto;

public class UpdateRessourceDto
{
    public string? Titre { get; set; }
    public string? Description { get; set; }
    public string? Format { get; set; }
    public Visibilite? Visibilite { get; set; }
    public long? IdCategorie { get; set; }
}
