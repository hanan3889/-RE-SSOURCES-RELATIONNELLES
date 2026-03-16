using System.ComponentModel.DataAnnotations;

namespace RessourceRelationnel.Domain.DTOs.AuthDto;

public class RegisterDto
{
    [Required]
    [MaxLength(255)]
    public string Nom { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Prenom { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}
