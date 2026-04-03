using System.ComponentModel.DataAnnotations;
using RessourceRelationnel.Domain.Models;

namespace RessourceRelationnel.Domain.DTOs.RessourceDto;

public class CreateRessourceDto
{
    [Required]
    [MaxLength(255)]
    public string Titre { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Format { get; set; } = string.Empty;

    [Required]
    public Visibilite Visibilite { get; set; }

    [Required]
    public long IdCategorie { get; set; }
}
