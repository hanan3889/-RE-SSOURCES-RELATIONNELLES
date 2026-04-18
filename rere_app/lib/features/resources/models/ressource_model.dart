/// Modèle Ressource (format API + format UI).

class RessourceDto {
  final int idRessource;
  final String titre;
  final String description;
  final String format;
  final String visibilite;
  final String statut;
  final String dateCreation;
  final int idUtilisateur;
  final String nomAuteur;
  final String prenomAuteur;
  final int idCategorie;
  final String nomCategorie;

  const RessourceDto({
    required this.idRessource,
    required this.titre,
    required this.description,
    required this.format,
    required this.visibilite,
    required this.statut,
    required this.dateCreation,
    required this.idUtilisateur,
    required this.nomAuteur,
    required this.prenomAuteur,
    required this.idCategorie,
    required this.nomCategorie,
  });

  factory RessourceDto.fromJson(Map<String, dynamic> json) => RessourceDto(
        idRessource: json['idRessource'] as int,
        titre: json['titre'] as String? ?? '',
        description: json['description'] as String? ?? '',
        format: json['format'] as String? ?? '',
        visibilite: json['visibilite'] as String? ?? '',
        statut: json['statut'] as String? ?? '',
        dateCreation: json['dateCreation'] as String? ?? '',
        idUtilisateur: json['idUtilisateur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
        idCategorie: json['idCategorie'] as int? ?? 0,
        nomCategorie: json['nomCategorie'] as String? ?? '',
      );

  Ressource toModel() => Ressource(
        id: idRessource,
        titre: titre,
        description: description,
        format: format,
        visibilite: visibilite,
        statut: statut,
        dateCreation: DateTime.tryParse(dateCreation) ?? DateTime.now(),
        auteur: '$prenomAuteur $nomAuteur'.trim(),
        idUtilisateur: idUtilisateur,
        categorie: nomCategorie,
        idCategorie: idCategorie,
      );
}

class Ressource {
  final int id;
  final String titre;
  final String description;
  final String format;
  final String visibilite;
  final String statut;
  final DateTime dateCreation;
  final String auteur;
  final int idUtilisateur;
  final String categorie;
  final int idCategorie;

  const Ressource({
    required this.id,
    required this.titre,
    required this.description,
    required this.format,
    required this.visibilite,
    required this.statut,
    required this.dateCreation,
    required this.auteur,
    required this.idUtilisateur,
    required this.categorie,
    required this.idCategorie,
  });

  /// Libellé propre pour le statut.
  String get statutLabel {
    final s = statut.toLowerCase();
    if (s.contains('publi')) return 'Publiée';
    if (s.contains('valid')) return 'En validation';
    if (s.contains('rejet')) return 'Rejetée';
    if (s.contains('brouillon')) return 'Brouillon';
    if (s.contains('archiv')) return 'Archivée';
    return statut;
  }

  /// Libellé propre pour la visibilité.
  String get visibiliteLabel {
    final v = visibilite.toLowerCase();
    if (v.contains('connect')) return 'Citoyens connectés';
    if (v.contains('priv')) return 'Privée';
    return 'Publique';
  }
}

/// DTO pour la création d'une ressource.
class CreateRessourceDto {
  final String titre;
  final String description;
  final String format;
  final int visibilite; // enum index: 0=Publique, 1=Connectes, 2=Privee
  final int idCategorie;

  const CreateRessourceDto({
    required this.titre,
    required this.description,
    required this.format,
    required this.visibilite,
    required this.idCategorie,
  });

  Map<String, dynamic> toJson() => {
        'titre': titre,
        'description': description,
        'format': format,
        'visibilite': visibilite,
        'idCategorie': idCategorie,
      };
}

/// DTO pour la mise à jour d'une ressource.
class UpdateRessourceDto {
  final String? titre;
  final String? description;
  final String? format;
  final int? visibilite;
  final int? idCategorie;

  const UpdateRessourceDto({
    this.titre,
    this.description,
    this.format,
    this.visibilite,
    this.idCategorie,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (titre != null) map['titre'] = titre;
    if (description != null) map['description'] = description;
    if (format != null) map['format'] = format;
    if (visibilite != null) map['visibilite'] = visibilite;
    if (idCategorie != null) map['idCategorie'] = idCategorie;
    return map;
  }
}
