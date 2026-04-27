/// Tous les endpoints de l'API backend.
class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';

  // Ressources
  static const String ressources = '/ressources';
  static String ressourceById(int id) => '/ressources/$id';
  static const String mesRessources = '/ressources/mes-ressources';
  static String ressourcesAdmin({String? statut}) {
    final base = '/admin/ressources';
    return statut != null ? '$base?statut=$statut' : base;
  }

  // Catégories
  static const String categories = '/admin/categories';
  static String categorieById(int id) => '/admin/categories/$id';

  // Commentaires
  static String commentaires(int ressourceId) =>
      '/ressources/$ressourceId/commentaires';
  static String commentaireById(int ressourceId, int commentId) =>
      '/commentaires/$commentId';

  // Favoris
  static String favoriToggle(int ressourceId) =>
      '/ressources/$ressourceId/favoris';
  static const String mesFavoris = '/ressources/favoris';

  // Messages
  static const String messages = '/messages';
  static String messageById(int id) => '/messages/$id';
  static const String messagesAdmin = '/messages';

  // Modération
  static const String moderationQueue = '/moderateur/ressources';
  static String modererValider(int id) =>
      '/moderateur/ressources/$id/valider';
  static String modererRefuser(int id) =>
      '/moderateur/ressources/$id/refuser';

  // Progression
  static const String progression = '/progression';

  // Utilisateurs
  static const String users = '/users';
  static String userById(int id) => '/users/$id';
  static String userToggleActive(int id) => '/admin/utilisateurs/$id/statut';
  static String userResetPassword(int id) => '/users/$id/reset-password';
  static const String createAdminUser = '/superadmin/utilisateurs';
}
