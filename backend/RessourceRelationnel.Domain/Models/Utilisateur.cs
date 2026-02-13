namespace RessourceRelationnel.Domain.Models;

public class Utilisateur
{
    public long IdUtilisateur { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public long IdRole { get; set; }
    public Role? Role { get; set; }

    public ICollection<Ressource> Ressources { get; set; } = new List<Ressource>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Progression> Progressions { get; set; } = new List<Progression>();
    public ICollection<Statistique> Statistiques { get; set; } = new List<Statistique>();
}
