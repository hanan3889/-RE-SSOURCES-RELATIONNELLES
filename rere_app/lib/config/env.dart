/// Configuration d'environnement de l'application.
class Env {
  Env._();

  /// URL de base de l'API backend.
  static const String apiBaseUrl = 'http://localhost:8080/api';

  /// Clé de stockage du JWT.
  static const String jwtStorageKey = 'rr_access_token';

  /// Clé de stockage de l'utilisateur courant.
  static const String userStorageKey = 'rr_current_user';

  /// Timeout des requêtes HTTP (en secondes).
  static const int httpTimeout = 30;

  /// Taille de page par défaut pour la pagination.
  static const int defaultPageSize = 20;
}
