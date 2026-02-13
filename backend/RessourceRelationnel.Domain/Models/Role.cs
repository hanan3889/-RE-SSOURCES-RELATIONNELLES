namespace RessourceRelationnel.Domain.Models;

public class Role
{
    public long IdRole { get; set; }
    public string NomRole { get; set; } = string.Empty;

    public ICollection<Utilisateur> Utilisateurs { get; set; } = new List<Utilisateur>();
}
