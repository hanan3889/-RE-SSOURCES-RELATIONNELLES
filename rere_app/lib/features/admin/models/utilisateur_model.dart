/// Modèle Utilisateur (admin).

class Utilisateur {
  final int id;
  final String nom;
  final String prenom;
  final String email;
  final bool isActive;
  final bool isEmailVerified;
  final DateTime? createdAt;
  final DateTime? lastLoginAt;
  final DateTime? updatedAt;
  final int idRole;
  final String? nomRole;

  const Utilisateur({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    this.isActive = true,
    this.isEmailVerified = false,
    this.createdAt,
    this.lastLoginAt,
    this.updatedAt,
    this.idRole = 1,
    this.nomRole,
  });

  factory Utilisateur.fromJson(Map<String, dynamic> json) => Utilisateur(
        id: json['idUtilisateur'] as int,
        nom: json['nom'] as String? ?? '',
        prenom: json['prenom'] as String? ?? '',
        email: json['email'] as String? ?? '',
        isActive: json['isActive'] as bool? ?? true,
        isEmailVerified: json['isEmailVerified'] as bool? ?? false,
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'])
            : null,
        lastLoginAt: json['lastLoginAt'] != null
            ? DateTime.tryParse(json['lastLoginAt'])
            : null,
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'])
            : null,
        idRole: json['idRole'] as int? ?? 1,
        nomRole: json['nomRole'] as String?,
      );

  String get fullName => '$prenom $nom'.trim();

  String get roleLabel {
    switch (nomRole ?? '') {
      case 'super_administrateur':
        return 'Super Admin';
      case 'administrateur':
        return 'Admin';
      case 'moderateur':
        return 'Modérateur';
      default:
        return 'Citoyen';
    }
  }
}
