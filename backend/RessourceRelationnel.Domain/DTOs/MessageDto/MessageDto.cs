namespace RessourceRelationnel.Domain.DTOs.MessageDto;

public class MessageDto
{
    public long IdMessage { get; set; }
    public string Contenu { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
    public long IdAuteur { get; set; }
    public string NomAuteur { get; set; } = string.Empty;
    public string PrenomAuteur { get; set; } = string.Empty;
}

public class CreateMessageDto
{
    public string Contenu { get; set; } = string.Empty;
}
