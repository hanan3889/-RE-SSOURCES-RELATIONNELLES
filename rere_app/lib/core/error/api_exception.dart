import 'dart:io';
import 'package:dio/dio.dart';

/// Types d'erreurs applicatives.
enum ApiErrorType {
  /// Pas de connexion réseau / serveur injoignable.
  network,

  /// Timeout (requête trop longue).
  timeout,

  /// 400 — Requête invalide.
  badRequest,

  /// 401 — Non authentifié / session expirée.
  unauthorized,

  /// 403 — Accès refusé.
  forbidden,

  /// 404 — Ressource introuvable.
  notFound,

  /// 409 — Conflit (ex: email déjà utilisé).
  conflict,

  /// 422 — Données invalides.
  validation,

  /// 429 — Trop de requêtes.
  tooManyRequests,

  /// 500+ — Erreur serveur.
  server,

  /// Erreur de parsing / format inattendu.
  format,

  /// Erreur inconnue / générique.
  unknown,
}

/// Exception applicative avec message utilisateur en français.
class ApiException implements Exception {
  final ApiErrorType type;
  final String userMessage;
  final String? technicalMessage;
  final int? statusCode;

  const ApiException({
    required this.type,
    required this.userMessage,
    this.technicalMessage,
    this.statusCode,
  });

  /// Convertit une [DioException] en [ApiException] avec un message
  /// utilisateur propre en français.
  factory ApiException.fromDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          type: ApiErrorType.timeout,
          userMessage:
              'Le serveur met trop de temps à répondre. Vérifiez votre connexion et réessayez.',
        );

      case DioExceptionType.connectionError:
        return ApiException(
          type: ApiErrorType.network,
          userMessage:
              'Impossible de joindre le serveur. Vérifiez que vous êtes connecté à Internet.',
          technicalMessage: e.message,
        );

      case DioExceptionType.badResponse:
        return _fromStatusCode(
          e.response?.statusCode,
          e.response?.data,
          e.message,
        );

      case DioExceptionType.cancel:
        return const ApiException(
          type: ApiErrorType.unknown,
          userMessage: 'La requête a été annulée.',
        );

      case DioExceptionType.badCertificate:
        return const ApiException(
          type: ApiErrorType.network,
          userMessage:
              'Erreur de certificat SSL. Contactez le support technique.',
        );

      case DioExceptionType.unknown:
        // SocketException = pas de réseau
        if (e.error is SocketException) {
          return const ApiException(
            type: ApiErrorType.network,
            userMessage:
                'Connexion impossible. Vérifiez votre connexion Internet ou réessayez plus tard.',
          );
        }
        return ApiException(
          type: ApiErrorType.unknown,
          userMessage:
              'Une erreur inattendue est survenue. Réessayez plus tard.',
          technicalMessage: e.message,
        );
    }
  }

  /// Convertit n'importe quelle exception en [ApiException].
  factory ApiException.fromException(Object error) {
    if (error is ApiException) return error;
    if (error is DioException) return ApiException.fromDioException(error);

    if (error is SocketException) {
      return const ApiException(
        type: ApiErrorType.network,
        userMessage:
            'Connexion impossible. Vérifiez votre connexion Internet.',
      );
    }

    if (error is FormatException || error is TypeError) {
      return ApiException(
        type: ApiErrorType.format,
        userMessage:
            'Le serveur a renvoyé une réponse inattendue. Réessayez plus tard.',
        technicalMessage: error.toString(),
      );
    }

    return ApiException(
      type: ApiErrorType.unknown,
      userMessage: 'Une erreur inattendue est survenue. Réessayez plus tard.',
      technicalMessage: error.toString(),
    );
  }

  /// Crée l'exception à partir du code HTTP.
  static ApiException _fromStatusCode(
    int? statusCode,
    dynamic responseData,
    String? technicalMsg,
  ) {
    // Essaye d'extraire un message du body JSON
    String? serverMessage;
    if (responseData is Map<String, dynamic>) {
      serverMessage = responseData['message'] as String? ??
          responseData['error'] as String? ??
          responseData['title'] as String?;
    }

    switch (statusCode) {
      case 400:
        return ApiException(
          type: ApiErrorType.badRequest,
          userMessage: serverMessage ?? 'Requête invalide. Vérifiez les données saisies.',
          statusCode: 400,
          technicalMessage: technicalMsg,
        );

      case 401:
        return ApiException(
          type: ApiErrorType.unauthorized,
          userMessage:
              serverMessage ?? 'Session expirée. Veuillez vous reconnecter.',
          statusCode: 401,
          technicalMessage: technicalMsg,
        );

      case 403:
        return ApiException(
          type: ApiErrorType.forbidden,
          userMessage: serverMessage ??
              'Vous n\'avez pas les droits nécessaires pour cette action.',
          statusCode: 403,
          technicalMessage: technicalMsg,
        );

      case 404:
        return ApiException(
          type: ApiErrorType.notFound,
          userMessage: serverMessage ??
              'L\'élément demandé est introuvable ou a été supprimé.',
          statusCode: 404,
          technicalMessage: technicalMsg,
        );

      case 409:
        return ApiException(
          type: ApiErrorType.conflict,
          userMessage: serverMessage ??
              'Un conflit est survenu. Cet élément existe peut-être déjà.',
          statusCode: 409,
          technicalMessage: technicalMsg,
        );

      case 422:
        return ApiException(
          type: ApiErrorType.validation,
          userMessage: serverMessage ??
              'Les données envoyées ne sont pas valides. Vérifiez le formulaire.',
          statusCode: 422,
          technicalMessage: technicalMsg,
        );

      case 429:
        return ApiException(
          type: ApiErrorType.tooManyRequests,
          userMessage:
              'Trop de requêtes. Patientez un instant avant de réessayer.',
          statusCode: 429,
          technicalMessage: technicalMsg,
        );

      default:
        if (statusCode != null && statusCode >= 500) {
          return ApiException(
            type: ApiErrorType.server,
            userMessage:
                'Le serveur rencontre un problème. Réessayez dans quelques instants.',
            statusCode: statusCode,
            technicalMessage: technicalMsg,
          );
        }
        return ApiException(
          type: ApiErrorType.unknown,
          userMessage: serverMessage ??
              'Une erreur inattendue est survenue (code $statusCode).',
          statusCode: statusCode,
          technicalMessage: technicalMsg,
        );
    }
  }

  @override
  String toString() => 'ApiException($type, $statusCode): $userMessage';
}
