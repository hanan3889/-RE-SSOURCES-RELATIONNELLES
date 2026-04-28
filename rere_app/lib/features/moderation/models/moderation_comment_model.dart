class ModerationCommentaire {
  final int idCommentaire;
  final int? idCommentaireParent;
  final String contenu;
  final DateTime dateCreation;
  final int idUtilisateur;
  final String nomAuteur;
  final String prenomAuteur;
  final int idRessource;
  final String titreRessource;

  const ModerationCommentaire({
    required this.idCommentaire,
    this.idCommentaireParent,
    required this.contenu,
    required this.dateCreation,
    required this.idUtilisateur,
    required this.nomAuteur,
    required this.prenomAuteur,
    required this.idRessource,
    required this.titreRessource,
  });

  factory ModerationCommentaire.fromJson(Map<String, dynamic> json) =>
      ModerationCommentaire(
        idCommentaire: json['idCommentaire'] as int,
        idCommentaireParent: json['idCommentaireParent'] as int?,
        contenu: json['contenu'] as String? ?? '',
        dateCreation:
            DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
        idUtilisateur: json['idUtilisateur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
        idRessource: json['idRessource'] as int? ?? 0,
        titreRessource: json['titreRessource'] as String? ?? '',
      );

  String get auteurFullName => '$prenomAuteur $nomAuteur'.trim();
}
