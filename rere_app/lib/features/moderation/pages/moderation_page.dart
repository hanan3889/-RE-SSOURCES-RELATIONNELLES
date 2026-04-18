import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/moderation_provider.dart';
import '../../resources/models/ressource_model.dart';

class ModerationPage extends ConsumerWidget {
  const ModerationPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queue = ref.watch(moderationQueueProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Moderation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(moderationQueueProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
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
          loading: () =>
              const AppLoadingWidget(message: 'Chargement de la file...'),
          error: (e, _) => AppErrorWidget(
            error: e,
            onRetry: () => ref.invalidate(moderationQueueProvider),
          ),
        ),
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
