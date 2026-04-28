import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../models/message_model.dart';

/// Mes messages.
final messagesProvider = FutureProvider<List<Message>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.messages);
  return (response.data as List)
      .map((e) => Message.fromJson(e as Map<String, dynamic>))
      .toList();
});

/// Discussion par ressource.
final discussionMessagesProvider =
  FutureProvider.family<List<Message>, int>((ref, ressourceId) async {
  final dio = ref.read(apiClientProvider);
  final response =
    await dio.get(ApiEndpoints.messagesDiscussion(ressourceId));
  return (response.data as List)
    .map((e) => Message.fromJson(e as Map<String, dynamic>))
    .toList();
});

/// Tous les messages (admin).
final allMessagesProvider = FutureProvider<List<Message>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.messagesAdmin);
  return (response.data as List)
      .map((e) => Message.fromJson(e as Map<String, dynamic>))
      .toList();
});

/// Actions messages.
class MessageActions {
  final Dio _dio;
  MessageActions(this._dio);

  Future<Message> send(CreateMessageDto dto) async {
    final response =
        await _dio.post(ApiEndpoints.messages, data: dto.toJson());
    return Message.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Message> getById(int id) async {
    final response = await _dio.get(ApiEndpoints.messageById(id));
    return Message.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Message> sendDiscussionMessage(
      int ressourceId, CreateDiscussionMessageDto dto) async {
    final response = await _dio.post(
      ApiEndpoints.messagesDiscussion(ressourceId),
      data: dto.toJson(),
    );
    return Message.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Message> inviteParticipant(
      int ressourceId, InviteParticipantDto dto) async {
    final response = await _dio.post(
      ApiEndpoints.messagesInvite(ressourceId),
      data: dto.toJson(),
    );
    return Message.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> delete(int id) async {
    await _dio.delete(ApiEndpoints.messageById(id));
  }
}

final messageActionsProvider = Provider<MessageActions>((ref) {
  return MessageActions(ref.read(apiClientProvider));
});
