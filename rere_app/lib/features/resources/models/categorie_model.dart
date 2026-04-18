/// Modèle Catégorie.

class Categorie {
  final int id;
  final String nom;

  const Categorie({required this.id, required this.nom});

  factory Categorie.fromJson(Map<String, dynamic> json) => Categorie(
        id: json['idCategorie'] as int,
        nom: json['nomCategorie'] as String,
      );
}

class CreateCategorieDto {
  final String nom;
  const CreateCategorieDto({required this.nom});
  Map<String, dynamic> toJson() => {'nomCategorie': nom};
}
