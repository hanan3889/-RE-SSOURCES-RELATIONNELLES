import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../core/error/api_exception.dart';
import '../../core/error/error_helpers.dart';

/// Widget d'erreur riche avec icône contextuelle, message propre
/// et bouton réessayer.
class AppErrorWidget extends StatelessWidget {
  /// Message brut à afficher (fallback si [error] est null).
  final String? message;

  /// L'objet erreur original — sera converti en message propre.
  final Object? error;

  /// Callback pour réessayer.
  final VoidCallback? onRetry;

  /// Compact mode (inline, sans grande icône).
  final bool compact;

  const AppErrorWidget({
    super.key,
    this.message,
    this.error,
    this.onRetry,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final displayMessage =
        error != null ? ErrorHelpers.userMessage(error!) : (message ?? 'Une erreur est survenue');
    final icon = error != null
        ? ErrorHelpers.iconForError(error!)
        : Icons.error_outline_rounded;
    final color = error != null
        ? ErrorHelpers.colorForError(error!)
        : AppColors.error;
    final subtitle = _subtitleForError(error);

    if (compact) {
      return _CompactError(
        message: displayMessage,
        icon: icon,
        color: color,
        onRetry: onRetry,
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icône dans un cercle coloré
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 48, color: color),
            ),
            const SizedBox(height: 20),

            // Message principal
            Text(
              displayMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
                height: 1.5,
              ),
            ),

            // Sous-titre (conseil)
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
            ],

            // Bouton réessayer
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Réessayer'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: color,
                    side: BorderSide(color: color.withValues(alpha: 0.5)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Conseil contextuel sous le message d'erreur.
  String? _subtitleForError(Object? error) {
    if (error == null) return null;
    final type = error is ApiException
        ? error.type
        : ApiException.fromException(error).type;

    switch (type) {
      case ApiErrorType.network:
        return 'Vérifiez votre Wi-Fi ou vos données mobiles, puis réessayez.';
      case ApiErrorType.timeout:
        return 'Le serveur est peut-être surchargé. Réessayez dans un instant.';
      case ApiErrorType.unauthorized:
        return 'Reconnectez-vous pour continuer.';
      case ApiErrorType.forbidden:
        return 'Si vous pensez que c\'est une erreur, contactez un administrateur.';
      case ApiErrorType.server:
        return 'Notre équipe a été notifiée. Merci de votre patience.';
      case ApiErrorType.notFound:
        return 'L\'élément a peut-être été supprimé ou déplacé.';
      case ApiErrorType.tooManyRequests:
        return 'Patientez quelques secondes avant de réessayer.';
      default:
        return null;
    }
  }
}

/// Version compacte pour les erreurs inline (dans une liste, un card, etc.).
class _CompactError extends StatelessWidget {
  final String message;
  final IconData icon;
  final Color color;
  final VoidCallback? onRetry;

  const _CompactError({
    required this.message,
    required this.icon,
    required this.color,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 13,
                color: color,
                fontWeight: FontWeight.w500,
                height: 1.3,
              ),
            ),
          ),
          if (onRetry != null) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onRetry,
              child: Icon(Icons.refresh_rounded, size: 20, color: color),
            ),
          ],
        ],
      ),
    );
  }
}

/// Widget inline pour les sections de page (catégories, commentaires, etc.)
/// qui doivent afficher une erreur sans prendre toute la page.
class InlineSectionError extends StatelessWidget {
  final Object error;
  final VoidCallback? onRetry;
  final String? fallbackMessage;

  const InlineSectionError({
    super.key,
    required this.error,
    this.onRetry,
    this.fallbackMessage,
  });

  @override
  Widget build(BuildContext context) {
    return AppErrorWidget(
      error: error,
      onRetry: onRetry,
      compact: true,
    );
  }
}
