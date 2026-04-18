import 'package:flutter/material.dart';
import 'api_exception.dart';

/// Helpers pour afficher les erreurs de manière cohérente dans l'app.
class ErrorHelpers {
  ErrorHelpers._();

  /// Transforme n'importe quel objet erreur en message utilisateur propre.
  static String userMessage(Object error) {
    if (error is ApiException) return error.userMessage;
    return ApiException.fromException(error).userMessage;
  }

  /// Retourne l'icône appropriée selon le type d'erreur.
  static IconData iconForError(Object error) {
    final type = error is ApiException
        ? error.type
        : ApiException.fromException(error).type;

    switch (type) {
      case ApiErrorType.network:
        return Icons.wifi_off_rounded;
      case ApiErrorType.timeout:
        return Icons.hourglass_empty_rounded;
      case ApiErrorType.unauthorized:
        return Icons.lock_outline_rounded;
      case ApiErrorType.forbidden:
        return Icons.block_rounded;
      case ApiErrorType.notFound:
        return Icons.search_off_rounded;
      case ApiErrorType.server:
        return Icons.cloud_off_rounded;
      case ApiErrorType.conflict:
        return Icons.warning_amber_rounded;
      case ApiErrorType.validation:
      case ApiErrorType.badRequest:
        return Icons.edit_off_rounded;
      case ApiErrorType.tooManyRequests:
        return Icons.speed_rounded;
      case ApiErrorType.format:
      case ApiErrorType.unknown:
        return Icons.error_outline_rounded;
    }
  }

  /// Retourne la couleur appropriée selon le type d'erreur.
  static Color colorForError(Object error) {
    final type = error is ApiException
        ? error.type
        : ApiException.fromException(error).type;

    switch (type) {
      case ApiErrorType.network:
      case ApiErrorType.timeout:
        return const Color(0xFFEA580C); // orange
      case ApiErrorType.unauthorized:
      case ApiErrorType.forbidden:
        return const Color(0xFFDC2626); // rouge
      case ApiErrorType.server:
        return const Color(0xFF7C3AED); // violet
      case ApiErrorType.notFound:
        return const Color(0xFF64748B); // gris
      default:
        return const Color(0xFFDC2626); // rouge par défaut
    }
  }

  /// Affiche un SnackBar d'erreur élégant.
  static void showErrorSnackBar(BuildContext context, Object error) {
    final msg = userMessage(error);
    final icon = iconForError(error);
    final color = colorForError(error);

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  msg,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 4),
          action: SnackBarAction(
            label: 'OK',
            textColor: Colors.white70,
            onPressed: () =>
                ScaffoldMessenger.of(context).hideCurrentSnackBar(),
          ),
        ),
      );
  }

  /// Affiche un SnackBar de succès.
  static void showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_outline,
                  color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 3),
        ),
      );
  }
}
