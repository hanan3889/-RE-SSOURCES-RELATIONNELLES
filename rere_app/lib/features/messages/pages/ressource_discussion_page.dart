import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../models/message_model.dart';
import '../providers/message_provider.dart';

class RessourceDiscussionPage extends ConsumerStatefulWidget {
  final int ressourceId;
  const RessourceDiscussionPage({super.key, required this.ressourceId});

  @override
  ConsumerState<RessourceDiscussionPage> createState() =>
      _RessourceDiscussionPageState();
}

class _RessourceDiscussionPageState
    extends ConsumerState<RessourceDiscussionPage> {
  final _messageCtrl = TextEditingController();
  final _inviteCtrl = TextEditingController();
  final _inviteMessageCtrl = TextEditingController();
  bool _sending = false;
  bool _inviting = false;

  @override
  void dispose() {
    _messageCtrl.dispose();
    _inviteCtrl.dispose();
    _inviteMessageCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendDiscussion() async {
    final text = _messageCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(messageActionsProvider).sendDiscussionMessage(
            widget.ressourceId,
            CreateDiscussionMessageDto(contenu: text),
          );
      _messageCtrl.clear();
      ref.invalidate(discussionMessagesProvider(widget.ressourceId));
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _invite() async {
    final target = _inviteCtrl.text.trim();
    if (target.isEmpty) {
      ErrorHelpers.showErrorSnackBar(
          context, 'Destinataire requis (ex: "prenom nom").');
      return;
    }
    setState(() => _inviting = true);
    try {
      await ref.read(messageActionsProvider).inviteParticipant(
            widget.ressourceId,
            InviteParticipantDto(
              cible: target,
              message: _inviteMessageCtrl.text.trim(),
            ),
          );
      _inviteCtrl.clear();
      _inviteMessageCtrl.clear();
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(context, 'Invitation envoyée.');
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    } finally {
      if (mounted) setState(() => _inviting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final discussion =
        ref.watch(discussionMessagesProvider(widget.ressourceId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Discussion'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.invalidate(discussionMessagesProvider(widget.ressourceId)),
          )
        ],
      ),
      body: Column(
        children: [
          // Invitation
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Inviter un participant',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _inviteCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Destinataire (ex: prenom nom)',
                        isDense: true,
                      ),
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _inviteMessageCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Message (optionnel)',
                        isDense: true,
                      ),
                      textInputAction: TextInputAction.done,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: ElevatedButton.icon(
                        onPressed: _inviting ? null : _invite,
                        icon: const Icon(Icons.mail_outline, size: 18),
                        label: _inviting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Inviter'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Liste discussion
          Expanded(
            child: discussion.when(
              data: (list) {
                if (list.isEmpty) {
                  return const Center(
                    child: Text('Aucun message pour le moment.'),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _DiscussionBubble(message: list[i]),
                );
              },
              loading: () =>
                  const AppLoadingWidget(message: 'Chargement...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: () => ref.invalidate(
                    discussionMessagesProvider(widget.ressourceId)),
              ),
            ),
          ),

          // Champ de discussion
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 8, 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Écrire un message...',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendDiscussion(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _sending ? null : _sendDiscussion,
                    icon: _sending
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiscussionBubble extends StatelessWidget {
  final Message message;
  const _DiscussionBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message.fullName,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            message.contenu,
            style: const TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 6),
          Text(
            DateFormat('dd/MM HH:mm').format(message.dateCreation),
            style: TextStyle(fontSize: 11, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}
