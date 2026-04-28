class StatisticsBreakdownItem {
  final String label;
  final int value;

  const StatisticsBreakdownItem({required this.label, required this.value});

  factory StatisticsBreakdownItem.fromJson(Map<String, dynamic> json) =>
      StatisticsBreakdownItem(
        label: json['label'] as String? ?? '',
        value: json['value'] as int? ?? 0,
      );
}

class StatisticsSummary {
  final int totalRessources;
  final int ressourcesPubliees;
  final int ressourcesEnValidation;
  final int ressourcesArchivees;
  final int totalUtilisateurs;
  final int utilisateursActifs;
  final int comptesCreesPeriode;
  final int favoris;
  final int commentaires;
  final int exploitations;
  final int sauvegardes;
  final int activitesDemarrees;
  final int invitationsEnvoyees;
  final int invitationsAcceptees;
  final int messagesDiscussion;

  const StatisticsSummary({
    required this.totalRessources,
    required this.ressourcesPubliees,
    required this.ressourcesEnValidation,
    required this.ressourcesArchivees,
    required this.totalUtilisateurs,
    required this.utilisateursActifs,
    required this.comptesCreesPeriode,
    required this.favoris,
    required this.commentaires,
    required this.exploitations,
    required this.sauvegardes,
    required this.activitesDemarrees,
    required this.invitationsEnvoyees,
    required this.invitationsAcceptees,
    required this.messagesDiscussion,
  });

  factory StatisticsSummary.fromJson(Map<String, dynamic> json) =>
      StatisticsSummary(
        totalRessources: json['totalRessources'] as int? ?? 0,
        ressourcesPubliees: json['ressourcesPubliees'] as int? ?? 0,
        ressourcesEnValidation: json['ressourcesEnValidation'] as int? ?? 0,
        ressourcesArchivees: json['ressourcesArchivees'] as int? ?? 0,
        totalUtilisateurs: json['totalUtilisateurs'] as int? ?? 0,
        utilisateursActifs: json['utilisateursActifs'] as int? ?? 0,
        comptesCreesPeriode: json['comptesCreesPeriode'] as int? ?? 0,
        favoris: json['favoris'] as int? ?? 0,
        commentaires: json['commentaires'] as int? ?? 0,
        exploitations: json['exploitations'] as int? ?? 0,
        sauvegardes: json['sauvegardes'] as int? ?? 0,
        activitesDemarrees: json['activitesDemarrees'] as int? ?? 0,
        invitationsEnvoyees: json['invitationsEnvoyees'] as int? ?? 0,
        invitationsAcceptees: json['invitationsAcceptees'] as int? ?? 0,
        messagesDiscussion: json['messagesDiscussion'] as int? ?? 0,
      );
}

class StatisticsResponse {
  final StatisticsSummary resume;
  final List<StatisticsBreakdownItem> creationsParCategorie;
  final List<StatisticsBreakdownItem> creationsParFormat;
  final List<StatisticsBreakdownItem> repartitionVisibilite;

  const StatisticsResponse({
    required this.resume,
    required this.creationsParCategorie,
    required this.creationsParFormat,
    required this.repartitionVisibilite,
  });

  factory StatisticsResponse.fromJson(Map<String, dynamic> json) =>
      StatisticsResponse(
        resume: StatisticsSummary.fromJson(
            json['resume'] as Map<String, dynamic>? ?? {}),
        creationsParCategorie:
            (json['creationsParCategorie'] as List? ?? [])
                .map((e) => StatisticsBreakdownItem.fromJson(
                    e as Map<String, dynamic>))
                .toList(),
        creationsParFormat: (json['creationsParFormat'] as List? ?? [])
            .map((e) => StatisticsBreakdownItem.fromJson(
                e as Map<String, dynamic>))
            .toList(),
        repartitionVisibilite:
            (json['repartitionVisibilite'] as List? ?? [])
                .map((e) => StatisticsBreakdownItem.fromJson(
                    e as Map<String, dynamic>))
                .toList(),
      );
  }
