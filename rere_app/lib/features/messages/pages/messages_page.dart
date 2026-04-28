import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/message_model.dart';
import '../providers/message_provider.dart';

class MessagesPage extends ConsumerStatefulWidget {
  const MessagesPage({super.key});
  @override
  ConsumerState<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends ConsumerState<MessagesPage> {
  final _targetCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _targetCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final target = _targetCtrl.text.trim();
    final text = _messageCtrl.text.trim();
    if (target.isEmpty) {
      ErrorHelpers.showErrorSnackBar(
          context, 'Destinataire requis (ex: "prenom nom").');
      return;
    }
    if (text.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(messageActionsProvider).send(
            CreateMessageDto(cible: target, contenu: text),
          );
      _messageCtrl.clear();
      ref.invalidate(messagesProvider);
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _deleteMessage(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer'),
        content: const Text('Supprimer ce message ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child:
                const Text('Supprimer', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await ref.read(messageActionsProvider).delete(id);
        ref.invalidate(messagesProvider);
      } catch (e) {
        if (context.mounted) {
          ErrorHelpers.showErrorSnackBar(context, e);
        }
      }
    }
  }

  Future<void> _openMessageDetail(int id) async {
    try {
      final detail = await ref.read(messageActionsProvider).getById(id);
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Détails du message'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Type : ${detail.typeMessage}'),
              const SizedBox(height: 6),
              if (detail.titreRessource != null)
                Text('Ressource : ${detail.titreRessource}'),
              if (detail.statutInvitation != null)
                Text('Invitation : ${detail.statutInvitation}'),
              const SizedBox(height: 12),
              Text(detail.contenu),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Fermer'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final allMessages = ref.watch(allMessagesProvider);
    final auth = ref.watch(authProvider);
    final isAdmin = auth.isAdmin;

    return DefaultTabController(
      length: isAdmin ? 2 : 1,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Messages'),
          bottom: isAdmin
              ? const TabBar(
                  tabs: [
                    Tab(text: 'Mes messages'),
                    Tab(text: 'Admin'),
                  ],
                )
              : null,
        ),
        body: TabBarView(
          children: [
            _MessagesTab(
              messages: messages,
              auth: auth,
              onDelete: _deleteMessage,
              onOpenDetail: _openMessageDetail,
              messageCtrl: _messageCtrl,
              targetCtrl: _targetCtrl,
              onSend: _sendMessage,
              sending: _sending,
              onRefresh: () => ref.invalidate(messagesProvider),
            ),
            if (isAdmin)
              _MessagesAdminTab(
                messages: allMessages,
                auth: auth,
                onOpenDetail: _openMessageDetail,
                onRefresh: () => ref.invalidate(allMessagesProvider),
              ),
          ],
        ),
      ),
    );
  }
}

class _MessagesTab extends StatelessWidget {
  final AsyncValue<List<Message>> messages;
  final AuthState auth;
  final void Function(int id) onDelete;
  final void Function(int id) onOpenDetail;
  final TextEditingController messageCtrl;
  final TextEditingController targetCtrl;
  final VoidCallback onSend;
  final bool sending;
  final VoidCallback onRefresh;

  const _MessagesTab({
    required this.messages,
    required this.auth,
    required this.onDelete,
    required this.onOpenDetail,
    required this.messageCtrl,
    required this.targetCtrl,
    required this.onSend,
    required this.sending,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Liste des messages
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async => onRefresh(),
            child: messages.when(
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.mail_outline,
                    title: 'Aucun message',
                    subtitle: 'Vos messages apparaitront ici.',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final msg = list[i];
                    final isMe = auth.user?.idUtilisateur == msg.idAuteur;
                    return _MessageBubble(
                      message: msg,
                      isMe: isMe,
                      onTap: () => onOpenDetail(msg.id),
                      onDelete: isMe ? () => onDelete(msg.id) : null,
                    );
                  },
                );
              },
              loading: () =>
                  const AppLoadingWidget(message: 'Chargement...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: onRefresh,
              ),
            ),
          ),
        ),

        // Champ de saisie
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
            child: Column(
              children: [
                TextField(
                  controller: targetCtrl,
                  decoration: const InputDecoration(
                    hintText: 'Destinataire (ex: prenom nom)',
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: messageCtrl,
                        decoration: const InputDecoration(
                          hintText: 'Votre message...',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 1,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => onSend(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: sending ? null : onSend,
                      icon: sending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MessagesAdminTab extends StatelessWidget {
  final AsyncValue<List<Message>> messages;
  final AuthState auth;
  final void Function(int id) onOpenDetail;
  final VoidCallback onRefresh;

  const _MessagesAdminTab({
    required this.messages,
    required this.auth,
    required this.onOpenDetail,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: messages.when(
        data: (list) {
          if (list.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.mail_outline,
              title: 'Aucun message',
              subtitle: 'Aucun message admin.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final msg = list[i];
              final isMe = auth.user?.idUtilisateur == msg.idAuteur;
              return _MessageBubble(
                message: msg,
                isMe: isMe,
                onTap: () => onOpenDetail(msg.id),
              );
            },
          );
        },
        loading: () => const AppLoadingWidget(message: 'Chargement...'),
        error: (e, _) => AppErrorWidget(
          error: e,
          onRetry: onRefresh,
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  final bool isMe;
  final VoidCallback? onDelete;
  final VoidCallback? onTap;

  const _MessageBubble({
    required this.message,
    required this.isMe,
    this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.75),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: isMe ? AppColors.primary : AppColors.surfaceVariant,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: Radius.circular(isMe ? 16 : 4),
              bottomRight: Radius.circular(isMe ? 4 : 16),
            ),
          ),
          child: Column(
            crossAxisAlignment:
                isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              if (!isMe)
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    message.fullName,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              Text(
                message.contenu,
                style: TextStyle(
                  fontSize: 14,
                  color: isMe ? Colors.white : AppColors.textPrimary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    DateFormat('HH:mm').format(message.dateCreation),
                    style: TextStyle(
                      fontSize: 11,
                      color: isMe ? Colors.white60 : AppColors.textHint,
                    ),
                  ),
                  if (onDelete != null) ...[
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onDelete,
                      child: Icon(
                        Icons.delete_outline,
                        size: 14,
                        color: isMe ? Colors.white60 : AppColors.error,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
