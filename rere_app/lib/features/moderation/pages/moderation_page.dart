import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/moderation_provider.dart';
import '../../resources/models/ressource_model.dart';
import '../models/moderation_comment_model.dart';

class ModerationPage extends ConsumerStatefulWidget {
  const ModerationPage({super.key});

  @override
  ConsumerState<ModerationPage> createState() => _ModerationPageState();
}

class _ModerationPageState extends ConsumerState<ModerationPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final queue = ref.watch(moderationQueueProvider);
    final commentaires = ref.watch(moderationCommentairesProvider(null));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Moderation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(moderationQueueProvider);
              ref.invalidate(moderationCommentairesProvider(null));
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          tabs: const [
            Tab(icon: Icon(Icons.verified), text: 'Ressources'),
            Tab(icon: Icon(Icons.comment_outlined), text: 'Commentaires'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          RefreshIndicator(
            onRefresh: () async => ref.invalidate(moderationQueueProvider),
            child: queue.when(
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.verified,
                    title: 'File vide',
                    subtitle: 'Aucune ressource en attente de moderation.',
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  itemBuilder: (_, i) => _ModerationCard(
                    ressource: list[i],
                    onValidate: () async {
                      try {
                        await ref
                            .read(moderationActionsProvider)
                            .valider(list[i].id);
                        ref.invalidate(moderationQueueProvider);
                        if (context.mounted) {
                          ErrorHelpers.showSuccessSnackBar(
                              context, 'Ressource validée');
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ErrorHelpers.showErrorSnackBar(context, e);
                        }
                      }
                    },
                    onReject: () async {
                      try {
                        await ref
                            .read(moderationActionsProvider)
                            .refuser(list[i].id);
                        ref.invalidate(moderationQueueProvider);
                        if (context.mounted) {
                          ErrorHelpers.showSuccessSnackBar(
                              context, 'Ressource refusée');
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ErrorHelpers.showErrorSnackBar(context, e);
                        }
                      }
                    },
                  ),
                );
              },
              loading: () => const AppLoadingWidget(
                  message: 'Chargement de la file...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: () => ref.invalidate(moderationQueueProvider),
              ),
            ),
          ),
          RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(moderationCommentairesProvider(null)),
            child: commentaires.when(
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.comment_outlined,
                    title: 'Aucun commentaire',
                    subtitle: 'Aucun commentaire à modérer.',
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  itemBuilder: (_, i) => _ModerationCommentCard(
                    commentaire: list[i],
                    onDelete: () async {
                      try {
                        await ref
                            .read(moderationActionsProvider)
                            .deleteCommentaire(list[i].idCommentaire);
                        ref.invalidate(moderationCommentairesProvider(null));
                        if (context.mounted) {
                          ErrorHelpers.showSuccessSnackBar(
                              context, 'Commentaire supprimé');
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ErrorHelpers.showErrorSnackBar(context, e);
                        }
                      }
                    },
                  ),
                );
              },
              loading: () => const AppLoadingWidget(message: 'Chargement...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: () =>
                    ref.invalidate(moderationCommentairesProvider(null)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModerationCard extends StatelessWidget {
  final Ressource ressource;
  final VoidCallback onValidate;
  final VoidCallback onReject;

  const _ModerationCard({
    required this.ressource,
    required this.onValidate,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'En attente',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.warning,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    ressource.categorie,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Titre
            Text(
              ressource.titre,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),

            // Description
            Text(
              ressource.description,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),

            // Auteur
            Row(
              children: [
                Icon(Icons.person_outline,
                    size: 14, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(
                  ressource.auteur,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                const Spacer(),
                Text(
                  ressource.format,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Boutons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onReject,
                    icon: const Icon(Icons.close, size: 18),
                    label: const Text('Refuser'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onValidate,
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Valider'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ModerationCommentCard extends StatelessWidget {
  final ModerationCommentaire commentaire;
  final VoidCallback onDelete;

  const _ModerationCommentCard({
    required this.commentaire,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.comment_outlined,
                    size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    commentaire.titreRessource,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline,
                      color: AppColors.error),
                )
              ],
            ),
            const SizedBox(height: 8),
            Text(
              commentaire.contenu,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 8),
            Text(
              'Par ${commentaire.auteurFullName}',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
