/// DTOs et modèles pour l'authentification.

class LoginDto {
  final String email;
  final String password;

  const LoginDto({required this.email, required this.password});

  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

class RegisterDto {
  final String nom;
  final String prenom;
  final String email;
  final String password;

  const RegisterDto({
    required this.nom,
    required this.prenom,
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'nom': nom,
        'prenom': prenom,
        'email': email,
        'password': password,
      };
}

class AuthResponse {
  final String token;
  final int idUtilisateur;
  final String email;
  final String nom;
  final String prenom;
  final String role;

  const AuthResponse({
    required this.token,
    required this.idUtilisateur,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.role,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
        token: json['token'] as String,
        idUtilisateur: json['idUtilisateur'] as int,
        email: json['email'] as String,
        nom: json['nom'] as String,
        prenom: json['prenom'] as String,
        role: json['role'] as String,
      );

  Map<String, dynamic> toJson() => {
        'token': token,
        'idUtilisateur': idUtilisateur,
        'email': email,
        'nom': nom,
        'prenom': prenom,
        'role': role,
      };

  bool get isAdmin =>
      role == 'administrateur' || role == 'super_administrateur';

  bool get isModerator =>
      role == 'moderateur' || isAdmin;

  String get fullName => '$prenom $nom'.trim();
}
