import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/ressource_model.dart';
import '../models/categorie_model.dart';
import '../models/commentaire_model.dart';

// ─── Catégories ───

final categoriesProvider = FutureProvider<List<Categorie>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.categories);
  return (response.data as List)
      .map((e) => Categorie.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ─── Ressources publiques ───

final ressourcesProvider =
    FutureProvider.family<List<Ressource>, Map<String, String?>>(
        (ref, filters) async {
  final dio = ref.read(apiClientProvider);
  final queryParams = <String, dynamic>{};
  if (filters['categorie'] != null) queryParams['categorie'] = filters['categorie'];
  if (filters['format'] != null) queryParams['format'] = filters['format'];
  if (filters['search'] != null) queryParams['recherche'] = filters['search'];
  if (filters['tri'] != null) queryParams['tri'] = filters['tri'];

  final response =
      await dio.get(ApiEndpoints.ressources, queryParameters: queryParams);
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

/// Liste de toutes les ressources sans filtres.
final allRessourcesProvider = FutureProvider<List<Ressource>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.ressources);
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

/// Ressources filtrées par catégorie (clé String pour que family == fonctionne).
final ressourcesByCategorieProvider =
    FutureProvider.family<List<Ressource>, String>((ref, categorie) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(
    ApiEndpoints.ressources,
    queryParameters: {'categorie': categorie},
  );
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

/// Détail d'une ressource.
final ressourceDetailProvider =
    FutureProvider.family<Ressource, int>((ref, id) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.ressourceById(id));
  return RessourceDto.fromJson(response.data as Map<String, dynamic>)
      .toModel();
});

// ─── Commentaires ───

final commentairesProvider =
    FutureProvider.family<List<Commentaire>, int>((ref, ressourceId) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.commentaires(ressourceId));
  return (response.data as List)
      .map((e) => Commentaire.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ─── Actions sur les ressources ───

class RessourceActions {
  final Dio _dio;
  RessourceActions(this._dio);

  Future<Ressource> create(CreateRessourceDto dto) async {
    final response =
        await _dio.post(ApiEndpoints.ressources, data: dto.toJson());
    return RessourceDto.fromJson(response.data as Map<String, dynamic>)
        .toModel();
  }

  Future<Ressource> update(int id, UpdateRessourceDto dto) async {
    final response =
        await _dio.put(ApiEndpoints.ressourceById(id), data: dto.toJson());
    return RessourceDto.fromJson(response.data as Map<String, dynamic>)
        .toModel();
  }

  Future<void> delete(int id) async {
    await _dio.delete(ApiEndpoints.ressourceById(id));
  }

  Future<void> addComment(int ressourceId, CreateCommentaireDto dto) async {
    await _dio.post(ApiEndpoints.commentaires(ressourceId),
        data: dto.toJson());
  }

  Future<void> deleteComment(int ressourceId, int commentId) async {
    await _dio
        .delete(ApiEndpoints.commentaireById(ressourceId, commentId));
  }

  Future<void> addFavori(int ressourceId) async {
    await _dio.post(ApiEndpoints.favoriToggle(ressourceId));
  }

  Future<void> removeFavori(int ressourceId) async {
    await _dio.delete(ApiEndpoints.favoriToggle(ressourceId));
  }
}

final ressourceActionsProvider = Provider<RessourceActions>((ref) {
  return RessourceActions(ref.read(apiClientProvider));
});
