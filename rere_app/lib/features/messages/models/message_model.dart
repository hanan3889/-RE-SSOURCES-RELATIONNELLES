/// Modèle Message.

class Message {
  final int id;
  final String contenu;
  final DateTime dateCreation;
  final String typeMessage;
  final String? statutInvitation;
  final int? idRessource;
  final String? titreRessource;
  final int idAuteur;
  final String nomAuteur;
  final String prenomAuteur;
  final int? idDestinataire;
  final String? nomDestinataire;
  final String? prenomDestinataire;

  const Message({
    required this.id,
    required this.contenu,
    required this.dateCreation,
    required this.typeMessage,
    this.statutInvitation,
    this.idRessource,
    this.titreRessource,
    required this.idAuteur,
    required this.nomAuteur,
    required this.prenomAuteur,
    this.idDestinataire,
    this.nomDestinataire,
    this.prenomDestinataire,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['idMessage'] as int,
        contenu: json['contenu'] as String? ?? '',
        dateCreation:
            DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
        typeMessage: json['typeMessage'] as String? ?? 'direct',
        statutInvitation: json['statutInvitation'] as String?,
        idRessource: json['idRessource'] as int?,
        titreRessource: json['titreRessource'] as String?,
        idAuteur: json['idAuteur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
        idDestinataire: json['idDestinataire'] as int?,
        nomDestinataire: json['nomDestinataire'] as String?,
        prenomDestinataire: json['prenomDestinataire'] as String?,
      );

  String get fullName => '$prenomAuteur $nomAuteur'.trim();
}

class CreateMessageDto {
  final String cible;
  final String contenu;
  const CreateMessageDto({required this.cible, required this.contenu});
  Map<String, dynamic> toJson() => {
        'cible': cible,
        'contenu': contenu,
      };
}

class InviteParticipantDto {
  final String cible;
  final String? message;
  const InviteParticipantDto({required this.cible, this.message});
  Map<String, dynamic> toJson() => {
        'cible': cible,
        if (message != null && message!.trim().isNotEmpty)
          'message': message!.trim(),
      };
}

class CreateDiscussionMessageDto {
  final String contenu;
  const CreateDiscussionMessageDto({required this.contenu});
  Map<String, dynamic> toJson() => {'contenu': contenu};
}
