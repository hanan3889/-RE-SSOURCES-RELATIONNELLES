namespace RessourceRelationnel.Domain.DTOs.MessageDto;

public class MessageDto
{
    public long IdMessage { get; set; }
    public string Contenu { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
    public string TypeMessage { get; set; } = "direct";
    public string? StatutInvitation { get; set; }
    public long? IdRessource { get; set; }
    public string? TitreRessource { get; set; }
    public long IdAuteur { get; set; }
    public string NomAuteur { get; set; } = string.Empty;
    public string PrenomAuteur { get; set; } = string.Empty;
    public long? IdDestinataire { get; set; }
    public string? NomDestinataire { get; set; }
    public string? PrenomDestinataire { get; set; }
}

public class CreateMessageDto
{
    public string Cible { get; set; } = string.Empty;
    public string Contenu { get; set; } = string.Empty;
}

public class InviteParticipantDto
{
    public string Cible { get; set; } = string.Empty;
    public string? Message { get; set; }
}

public class CreateDiscussionMessageDto
{
    public string Contenu { get; set; } = string.Empty;
}

public class SetInvitationStatusDto
{
    public bool Acceptee { get; set; }
}
