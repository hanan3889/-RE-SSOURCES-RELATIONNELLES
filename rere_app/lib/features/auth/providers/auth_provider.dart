import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/error/api_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/auth_models.dart';
/// État d'authentification.
class AuthState {
  final AuthResponse? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({AuthResponse? user, bool? isLoading, String? error}) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  bool get isAuthenticated => user != null;
  bool get isAdmin => user?.isAdmin ?? false;
  bool get isModerator => user?.isModerator ?? false;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _dio;
  final SecureStorageService _storage;

  AuthNotifier(this._dio, this._storage) : super(const AuthState()) {
    _restoreSession();
  }

  /// Restaure la session depuis le stockage.
  Future<void> _restoreSession() async {
    final userData = _storage.getCurrentUser();
    final token = _storage.getToken();
    if (userData != null && token != null) {
      state = AuthState(user: AuthResponse.fromJson(userData));
    }
  }
  /// Connexion.
  Future<bool> login(LoginDto dto) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.post(ApiEndpoints.login, data: dto.toJson());
      final auth = AuthResponse.fromJson(response.data);
      await _storage.saveToken(auth.token);
      await _storage.saveCurrentUser(auth.toJson());
      state = AuthState(user: auth);
      return true;
    } on DioException catch (e) {
      final apiError = e.error is ApiException
          ? e.error as ApiException
          : ApiException.fromDioException(e);
      final msg = e.response?.statusCode == 401
          ? 'Email ou mot de passe incorrect'
          : apiError.userMessage;
      state = state.copyWith(isLoading: false, error: msg);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: ApiException.fromException(e).userMessage,
      );
      return false;
    }
  }

  /// Inscription.
  Future<bool> register(RegisterDto dto) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response =
          await _dio.post(ApiEndpoints.register, data: dto.toJson());
      final auth = AuthResponse.fromJson(response.data);
      await _storage.saveToken(auth.token);
      await _storage.saveCurrentUser(auth.toJson());
      state = AuthState(user: auth);
      return true;
    } on DioException catch (e) {
      final apiError = e.error is ApiException
          ? e.error as ApiException
          : ApiException.fromDioException(e);
      final msg = e.response?.statusCode == 409
          ? 'Cet email est déjà utilisé'
          : apiError.userMessage;
      state = state.copyWith(isLoading: false, error: msg);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: ApiException.fromException(e).userMessage,
      );
      return false;
    }
  }

  /// Déconnexion.
  Future<void> logout() async {
    await _storage.clearAll();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.read(apiClientProvider);
  final storage = ref.read(secureStorageProvider);
  final notifier = AuthNotifier(dio, storage);

  // Branche le callback de session expirée pour déconnecter proprement.
  final sessionNotifier = ref.read(sessionExpiredNotifierProvider);
  sessionNotifier.onSessionExpired = () => notifier.logout();

  return notifier;
});
