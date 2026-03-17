using System.ComponentModel.DataAnnotations;

namespace RessourceRelationnel.Domain.DTOs.CommentaireDto;

public class CreateCommentaireDto
{
    [Required]
    [MinLength(1)]
    [MaxLength(2000)]
    public string Contenu { get; set; } = string.Empty;
}
