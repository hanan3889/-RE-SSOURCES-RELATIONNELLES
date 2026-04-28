/// Modèle Progression (statistiques citoyen).

class ProgressionStats {
  final int nbFavoris;
  final int nbMesRessources;
  final int nbPubliees;
  final int nbEnAttente;
  final int nbExploitees;
  final int nbSauvegardees;
  final int nbActivitesDemarrees;

  const ProgressionStats({
    this.nbFavoris = 0,
    this.nbMesRessources = 0,
    this.nbPubliees = 0,
    this.nbEnAttente = 0,
    this.nbExploitees = 0,
    this.nbSauvegardees = 0,
    this.nbActivitesDemarrees = 0,
  });

  factory ProgressionStats.fromJson(Map<String, dynamic> json) =>
      ProgressionStats(
        nbFavoris: json['nbFavoris'] as int? ?? 0,
        nbMesRessources: json['nbMesRessources'] as int? ?? 0,
        nbPubliees: json['nbPubliees'] as int? ?? 0,
        nbEnAttente: json['nbEnAttente'] as int? ?? 0,
        nbExploitees: json['nbExploitees'] as int? ?? 0,
        nbSauvegardees: json['nbSauvegardees'] as int? ?? 0,
        nbActivitesDemarrees: json['nbActivitesDemarrees'] as int? ?? 0,
      );
}

class ExploitationStatus {
  final int ressourceId;
  final bool exploitee;

  const ExploitationStatus({required this.ressourceId, required this.exploitee});

  factory ExploitationStatus.fromJson(Map<String, dynamic> json) =>
      ExploitationStatus(
        ressourceId: json['ressourceId'] as int? ?? 0,
        exploitee: json['exploitee'] as bool? ?? false,
      );
}

class SauvegardeStatus {
  final int ressourceId;
  final bool sauvegardee;

  const SauvegardeStatus({required this.ressourceId, required this.sauvegardee});

  factory SauvegardeStatus.fromJson(Map<String, dynamic> json) =>
      SauvegardeStatus(
        ressourceId: json['ressourceId'] as int? ?? 0,
        sauvegardee: json['sauvegardee'] as bool? ?? false,
      );
}

class DemarrageStatus {
  final int ressourceId;
  final bool demarree;

  const DemarrageStatus({required this.ressourceId, required this.demarree});

  factory DemarrageStatus.fromJson(Map<String, dynamic> json) =>
      DemarrageStatus(
        ressourceId: json['ressourceId'] as int? ?? 0,
        demarree: json['demarree'] as bool? ?? false,
      );
}
