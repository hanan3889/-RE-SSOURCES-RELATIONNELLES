namespace RessourceRelationnel.Domain.Models;

public class Progression
{
    public long IdProgression { get; set; }
    public string Valeur { get; set; } = string.Empty;

    public long IdUtilisateur { get; set; }
    public Utilisateur? Utilisateur { get; set; }
}
