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
