import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/env.dart';

/// Gestion du stockage local (JWT, session utilisateur).
/// Utilise SharedPreferences — compatible Windows, Web, Android, iOS.
class SecureStorageService {
  final SharedPreferences _prefs;

  SecureStorageService(this._prefs);

  // --- Token JWT ---

  String? getToken() => _prefs.getString(Env.jwtStorageKey);

  Future<void> saveToken(String token) =>
      _prefs.setString(Env.jwtStorageKey, token);

  Future<void> deleteToken() => _prefs.remove(Env.jwtStorageKey);

  // --- Utilisateur courant (JSON sérialisé) ---

  Map<String, dynamic>? getCurrentUser() {
    final raw = _prefs.getString(Env.userStorageKey);
    if (raw == null) return null;
    return json.decode(raw) as Map<String, dynamic>;
  }

  Future<void> saveCurrentUser(Map<String, dynamic> user) =>
      _prefs.setString(Env.userStorageKey, json.encode(user));

  Future<void> clearAll() async {
    await _prefs.remove(Env.jwtStorageKey);
    await _prefs.remove(Env.userStorageKey);
  }
}

final secureStorageProvider =
    Provider<SecureStorageService>((ref) => throw UnimplementedError());

/// Initialise le provider au démarrage de l'app (dans main.dart).
Future<Override> createStorageOverride() async {
  final prefs = await SharedPreferences.getInstance();
  return secureStorageProvider.overrideWithValue(SecureStorageService(prefs));
}
