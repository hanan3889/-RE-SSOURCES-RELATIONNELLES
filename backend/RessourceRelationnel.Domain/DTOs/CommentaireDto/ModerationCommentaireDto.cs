namespace RessourceRelationnel.Domain.DTOs.CommentaireDto;

public class ModerationCommentaireDto
{
    public long IdCommentaire { get; set; }
    public long? IdCommentaireParent { get; set; }
    public string Contenu { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
    public long IdUtilisateur { get; set; }
    public string NomAuteur { get; set; } = string.Empty;
    public string PrenomAuteur { get; set; } = string.Empty;
    public long IdRessource { get; set; }
    public string TitreRessource { get; set; } = string.Empty;
}
