import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../resources/models/ressource_model.dart';

/// File d'attente de modération.
final moderationQueueProvider = FutureProvider<List<Ressource>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.moderationQueue);
  return (response.data as List)
      .map((e) => RessourceDto.fromJson(e as Map<String, dynamic>).toModel())
      .toList();
});

/// Actions de modération.
class ModerationActions {
  final Ref _ref;
  ModerationActions(this._ref);

  Future<void> valider(int id) async {
    final dio = _ref.read(apiClientProvider);
    await dio.patch(ApiEndpoints.modererValider(id));
    _ref.invalidate(moderationQueueProvider);
  }

  Future<void> refuser(int id) async {
    final dio = _ref.read(apiClientProvider);
    await dio.patch(ApiEndpoints.modererRefuser(id));
    _ref.invalidate(moderationQueueProvider);
  }
}

final moderationActionsProvider = Provider<ModerationActions>((ref) {
  return ModerationActions(ref);
});
