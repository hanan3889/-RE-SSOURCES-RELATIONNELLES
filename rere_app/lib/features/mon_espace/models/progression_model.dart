/// Modèle Progression (statistiques citoyen).

class ProgressionStats {
  final int nbFavoris;
  final int nbMesRessources;
  final int nbPubliees;
  final int nbEnAttente;

  const ProgressionStats({
    this.nbFavoris = 0,
    this.nbMesRessources = 0,
    this.nbPubliees = 0,
    this.nbEnAttente = 0,
  });

  factory ProgressionStats.fromJson(Map<String, dynamic> json) =>
      ProgressionStats(
        nbFavoris: json['nbFavoris'] as int? ?? 0,
        nbMesRessources: json['nbMesRessources'] as int? ?? 0,
        nbPubliees: json['nbPubliees'] as int? ?? 0,
        nbEnAttente: json['nbEnAttente'] as int? ?? 0,
      );
}
