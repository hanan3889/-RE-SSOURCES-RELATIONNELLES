import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/env.dart';
import '../storage/secure_storage.dart';
import '../error/api_exception.dart';

/// Callback déclenché quand un 401 est reçu (session expirée).
/// Sera branché sur le logout de l'AuthNotifier.
typedef OnSessionExpired = void Function();

/// Conteneur pour le callback de session expirée.
/// Permet d'éviter une dépendance circulaire api_client ↔ auth.
class SessionExpiredNotifier {
  OnSessionExpired? onSessionExpired;
}

final sessionExpiredNotifierProvider =
    Provider<SessionExpiredNotifier>((_) => SessionExpiredNotifier());

/// Client HTTP Dio configuré avec intercepteur JWT et gestion d'erreur.
final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: Env.httpTimeout),
    receiveTimeout: const Duration(seconds: Env.httpTimeout),
    headers: {'Content-Type': 'application/json'},
  ));

  final storage = ref.read(secureStorageProvider);
  final sessionNotifier = ref.read(sessionExpiredNotifierProvider);

  // Intercepteur : injecte le token JWT dans chaque requête.
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      final token = storage.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (error, handler) {
      // 401 → token expiré, on déconnecte proprement.
      if (error.response?.statusCode == 401) {
        sessionNotifier.onSessionExpired?.call();
      }
      // Wrappe le DioException en ApiException pour un message propre.
      final apiError = ApiException.fromDioException(error);
      handler.next(
        DioException(
          requestOptions: error.requestOptions,
          response: error.response,
          type: error.type,
          error: apiError,
          message: apiError.userMessage,
        ),
      );
    },
  ));

  return dio;
});
