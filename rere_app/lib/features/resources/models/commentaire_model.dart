/// Modèle Commentaire.

class Commentaire {
  final int id;
  final String contenu;
  final DateTime dateCreation;
  final int idUtilisateur;
  final String nomAuteur;
  final String prenomAuteur;
  final int idRessource;

  const Commentaire({
    required this.id,
    required this.contenu,
    required this.dateCreation,
    required this.idUtilisateur,
    required this.nomAuteur,
    required this.prenomAuteur,
    required this.idRessource,
  });

  factory Commentaire.fromJson(Map<String, dynamic> json) => Commentaire(
        id: json['idCommentaire'] as int,
        contenu: json['contenu'] as String? ?? '',
        dateCreation: DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
        idUtilisateur: json['idUtilisateur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
        idRessource: json['idRessource'] as int? ?? 0,
      );

  String get fullName => '$prenomAuteur $nomAuteur'.trim();
}

class CreateCommentaireDto {
  final String contenu;
  const CreateCommentaireDto({required this.contenu});
  Map<String, dynamic> toJson() => {'contenu': contenu};
}
