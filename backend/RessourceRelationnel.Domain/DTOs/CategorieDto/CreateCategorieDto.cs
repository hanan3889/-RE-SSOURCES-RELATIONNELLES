using System.ComponentModel.DataAnnotations;

namespace RessourceRelationnel.Domain.DTOs.CategorieDto;

public class CreateCategorieDto
{
    [Required]
    [MaxLength(255)]
    public string NomCategorie { get; set; } = string.Empty;
}
