namespace RessourceRelationnel.Domain.DTOs.CommentaireDto;

public class MesCommentaireDto
{
    public long IdCommentaire { get; set; }
    public long IdRessource { get; set; }
    public string TitreRessource { get; set; } = string.Empty;
    public string Contenu { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
}
