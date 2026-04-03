namespace RessourceRelationnel.Domain.DTOs.AuthDto;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public long IdUtilisateur { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
