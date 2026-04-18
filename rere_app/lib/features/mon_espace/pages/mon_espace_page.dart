import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/resource_card.dart';
import '../providers/mon_espace_provider.dart';

class MonEspacePage extends ConsumerWidget {
  const MonEspacePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progression = ref.watch(progressionProvider);
    final mesRessources = ref.watch(mesRessourcesProvider);
    final mesFavoris = ref.watch(mesFavorisProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Mon Espace'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              tooltip: 'Créer une ressource',
              onPressed: () => context.push('/ressources/create'),
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.article_outlined), text: 'Mes ressources'),
              Tab(icon: Icon(Icons.favorite_outline), text: 'Favoris'),
            ],
          ),
        ),
        body: Column(
          children: [
            // ── Statistiques ──
            Padding(
              padding: const EdgeInsets.all(16),
              child: progression.when(
                data: (stats) => Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        label: 'Ressources',
                        value: '${stats.nbMesRessources}',
                        icon: Icons.article,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        label: 'Publiées',
                        value: '${stats.nbPubliees}',
                        icon: Icons.check_circle,
                        color: AppColors.success,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        label: 'Favoris',
                        value: '${stats.nbFavoris}',
                        icon: Icons.favorite,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ),
                loading: () => const SizedBox(
                  height: 80,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => InlineSectionError(
                  error: e,
                  onRetry: () => ref.invalidate(progressionProvider),
                ),
              ),
            ),

            // ── Tabs ──
            Expanded(
              child: TabBarView(
                children: [
                  // Tab 1: Mes ressources
                  RefreshIndicator(
                    onRefresh: () async {
                      ref.invalidate(mesRessourcesProvider);
                      ref.invalidate(progressionProvider);
                    },
                    child: mesRessources.when(
                      data: (list) {
                        if (list.isEmpty) {
                          return const EmptyStateWidget(
                            icon: Icons.edit_note,
                            title: 'Aucune ressource',
                            subtitle:
                                'Créez votre première ressource pour la partager avec la communauté.',
                          );
                        }
                        return ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: list.length,
                          itemBuilder: (_, i) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: ResourceCard(
                              ressource: list[i],
                              onTap: () =>
                                  context.push('/ressources/${list[i].id}'),
                            ),
                          ),
                        );
                      },
                      loading: () =>
                          const AppLoadingWidget(message: 'Chargement...'),
                      error: (e, _) => AppErrorWidget(
                        error: e,
                        onRetry: () => ref.invalidate(mesRessourcesProvider),
                      ),
                    ),
                  ),

                  // Tab 2: Favoris
                  RefreshIndicator(
                    onRefresh: () async => ref.invalidate(mesFavorisProvider),
                    child: mesFavoris.when(
                      data: (list) {
                        if (list.isEmpty) {
                          return const EmptyStateWidget(
                            icon: Icons.favorite_border,
                            title: 'Aucun favori',
                            subtitle:
                                'Ajoutez des ressources en favoris pour les retrouver ici.',
                          );
                        }
                        return ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: list.length,
                          itemBuilder: (_, i) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: ResourceCard(
                              ressource: list[i],
                              isFavorite: true,
                              onTap: () =>
                                  context.push('/ressources/${list[i].id}'),
                            ),
                          ),
                        );
                      },
                      loading: () =>
                          const AppLoadingWidget(message: 'Chargement...'),
                      error: (e, _) => AppErrorWidget(
                        error: e,
                        onRetry: () => ref.invalidate(mesFavorisProvider),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
