import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../resources/models/ressource_model.dart';
import '../../resources/models/categorie_model.dart';
import '../models/utilisateur_model.dart';

// ─── Utilisateurs ───

final adminUsersProvider = FutureProvider<List<Utilisateur>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.users);
  return (response.data as List)
      .map((e) => Utilisateur.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ─── Ressources admin (toutes) ───

final adminRessourcesProvider =
    FutureProvider.family<List<Ressource>, String?>((ref, statut) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.ressourcesAdmin(statut: statut));
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

// ─── Admin actions ───

class AdminActions {
  final Dio _dio;
  AdminActions(this._dio);

  // Users
  Future<void> updateUser(int id, Map<String, dynamic> data) async {
    await _dio.put(ApiEndpoints.userById(id), data: data);
  }

  Future<void> toggleUserActive(int id, bool active) async {
    await _dio.patch(ApiEndpoints.userToggleActive(id), data: active);
  }

  Future<void> resetUserPassword(int id, String newPassword) async {
    await _dio.post(ApiEndpoints.userResetPassword(id),
        data: {'newPassword': newPassword});
  }

  Future<void> deleteUser(int id) async {
    await _dio.delete(ApiEndpoints.userById(id));
  }

  Future<void> createAdminUser(Map<String, dynamic> data) async {
    await _dio.post(ApiEndpoints.createAdminUser, data: data);
  }

  // Catégories
  Future<Categorie> createCategorie(CreateCategorieDto dto) async {
    final response =
        await _dio.post(ApiEndpoints.categories, data: dto.toJson());
    return Categorie.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> updateCategorie(int id, CreateCategorieDto dto) async {
    await _dio.put(ApiEndpoints.categorieById(id), data: dto.toJson());
  }

  Future<void> deleteCategorie(int id) async {
    await _dio.delete(ApiEndpoints.categorieById(id));
  }
}

final adminActionsProvider = Provider<AdminActions>((ref) {
  return AdminActions(ref.read(apiClientProvider));
});
