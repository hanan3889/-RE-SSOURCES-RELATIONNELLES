import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../resources/models/ressource_model.dart';
import '../models/progression_model.dart';

// ─── Mes favoris ───

final mesFavorisProvider = FutureProvider<List<Ressource>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.mesFavoris);
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

// ─── Mes ressources ───

final mesRessourcesProvider = FutureProvider<List<Ressource>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.mesRessources);
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

// ─── Progression ───

final progressionProvider = FutureProvider<ProgressionStats>((ref) async {
  final dio = ref.read(apiClientProvider);
  try {
    final response = await dio.get(ApiEndpoints.progression);
    return ProgressionStats.fromJson(response.data as Map<String, dynamic>);
  } on DioException {
    return const ProgressionStats();
  }
});

// ─── Actions progression (sauvegarde/exploitation/demarrage) ───

class ProgressionActions {
  final Dio _dio;
  ProgressionActions(this._dio);

  Future<ExploitationStatus> getExploitationStatus(int ressourceId) async {
    final response = await _dio.get(ApiEndpoints.exploitationStatus(ressourceId));
    return ExploitationStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<ExploitationStatus> setExploitationStatus(
      int ressourceId, bool exploitee) async {
    final response = await _dio.put(
      ApiEndpoints.exploitationStatus(ressourceId),
      data: {'exploitee': exploitee},
    );
    return ExploitationStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<SauvegardeStatus> getSauvegardeStatus(int ressourceId) async {
    final response = await _dio.get(ApiEndpoints.sauvegardeStatus(ressourceId));
    return SauvegardeStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<SauvegardeStatus> setSauvegardeStatus(
      int ressourceId, bool sauvegardee) async {
    final response = await _dio.put(
      ApiEndpoints.sauvegardeStatus(ressourceId),
      data: {'sauvegardee': sauvegardee},
    );
    return SauvegardeStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<DemarrageStatus> getDemarrageStatus(int ressourceId) async {
    final response = await _dio.get(ApiEndpoints.demarrageStatus(ressourceId));
    return DemarrageStatus.fromJson(response.data as Map<String, dynamic>);
  }

  Future<DemarrageStatus> setDemarrageStatus(
      int ressourceId, bool demarree) async {
    final response = await _dio.put(
      ApiEndpoints.demarrageStatus(ressourceId),
      data: {'demarree': demarree},
    );
    return DemarrageStatus.fromJson(response.data as Map<String, dynamic>);
  }
}

final progressionActionsProvider = Provider<ProgressionActions>((ref) {
  return ProgressionActions(ref.read(apiClientProvider));
});

// ─── Mes ressources sauvegardées (mises de côté) ───

final mesSauvegardeesProvider = FutureProvider<List<Ressource>>((ref) async {
  final dio = ref.read(apiClientProvider);
  // Récupérer toutes les ressources publiques
  final allResponse = await dio.get(ApiEndpoints.ressources);
  final allRessources = (allResponse.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();

  // Vérifier le statut de sauvegarde pour chaque ressource
  final actions = ProgressionActions(dio);
  final saved = <Ressource>[];
  for (final r in allRessources) {
    try {
      final status = await actions.getSauvegardeStatus(r.id);
      if (status.sauvegardee) {
        saved.add(r);
      }
    } catch (_) {
      // Ignorer les erreurs (ressource supprimée, etc.)
    }
  }
  return saved;
});
