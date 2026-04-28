import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/resource_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/mon_espace_provider.dart';

class MonEspacePage extends ConsumerWidget {
  const MonEspacePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    // Garde d'authentification — réactif au changement d'état
    if (!auth.isAuthenticated) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_outline, size: 64, color: AppColors.primary),
                const SizedBox(height: 20),
                const Text(
                  'Connexion requise',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Connectez-vous pour accéder à votre espace personnel.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => context.push('/login'),
                  icon: const Icon(Icons.login),
                  label: const Text('Se connecter'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final progression = ref.watch(progressionProvider);
    final mesRessources = ref.watch(mesRessourcesProvider);
    final mesFavoris = ref.watch(mesFavorisProvider);
    final mesSauvegardees = ref.watch(mesSauvegardeesProvider);

    return DefaultTabController(
      length: 3,
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
              Tab(icon: Icon(Icons.bookmark_outline), text: 'Mises de côté'),
            ],
          ),
        ),
        body: Column(
          children: [
            // ── Header bienvenue ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.06),
                    AppColors.secondary.withValues(alpha: 0.04),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bonjour, ${auth.user?.prenom ?? ''} ${auth.user?.nom ?? ''}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Bienvenue dans votre espace personnel',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),

            // ── Statistiques (6 stats) ──
            Padding(
              padding: const EdgeInsets.all(12),
              child: progression.when(
                data: (stats) => Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: StatCard(
                            label: 'Favoris',
                            value: '${stats.nbFavoris}',
                            icon: Icons.favorite,
                            color: AppColors.error,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: StatCard(
                            label: 'Ressources',
                            value: '${stats.nbMesRessources}',
                            icon: Icons.article,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: StatCard(
                            label: 'Publiées',
                            value: '${stats.nbPubliees}',
                            icon: Icons.check_circle,
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: StatCard(
                            label: 'En attente',
                            value: '${stats.nbEnAttente}',
                            icon: Icons.hourglass_empty,
                            color: AppColors.warning,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: StatCard(
                            label: 'Exploitées',
                            value: '${stats.nbExploitees}',
                            icon: Icons.verified,
                            color: const Color(0xFF7C3AED),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: StatCard(
                            label: 'Mises de côté',
                            value: '${stats.nbSauvegardees}',
                            icon: Icons.bookmark,
                            color: const Color(0xFFEA580C),
                          ),
                        ),
                      ],
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

            // ── Actions rapides ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _QuickAction(
                      icon: Icons.explore_outlined,
                      label: 'Explorer',
                      onTap: () => context.go('/ressources'),
                    ),
                    const SizedBox(width: 8),
                    _QuickAction(
                      icon: Icons.add_circle_outline,
                      label: 'Créer',
                      onTap: () => context.push('/ressources/create'),
                    ),
                    const SizedBox(width: 8),
                    _QuickAction(
                      icon: Icons.person_outline,
                      label: 'Mon profil',
                      onTap: () => context.go('/profil'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),

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

                  // Tab 3: Mises de côté (sauvegardées)
                  RefreshIndicator(
                    onRefresh: () async =>
                        ref.invalidate(mesSauvegardeesProvider),
                    child: mesSauvegardees.when(
                      data: (list) {
                        if (list.isEmpty) {
                          return const EmptyStateWidget(
                            icon: Icons.bookmark_border,
                            title: 'Aucune ressource mise de côté',
                            subtitle:
                                'Mettez des ressources de côté depuis leur page de détail pour les retrouver ici.',
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
                        onRetry: () =>
                            ref.invalidate(mesSauvegardeesProvider),
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

/// Bouton d'action rapide.
class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.primary.withValues(alpha: 0.15),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
