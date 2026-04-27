/// Modèle Message.

class Message {
  final int id;
  final String contenu;
  final DateTime dateCreation;
  final int idAuteur;
  final String nomAuteur;
  final String prenomAuteur;

  const Message({
    required this.id,
    required this.contenu,
    required this.dateCreation,
    required this.idAuteur,
    required this.nomAuteur,
    required this.prenomAuteur,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
        id: json['idMessage'] as int,
        contenu: json['contenu'] as String? ?? '',
        dateCreation: DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
        idAuteur: json['idAuteur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
      );

  String get fullName => '$prenomAuteur $nomAuteur'.trim();
}

class CreateMessageDto {
  final String contenu;
  const CreateMessageDto({required this.contenu});
  Map<String, dynamic> toJson() => {'contenu': contenu};
}
