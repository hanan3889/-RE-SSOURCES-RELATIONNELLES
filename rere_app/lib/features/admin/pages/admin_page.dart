import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../models/utilisateur_model.dart';
import '../providers/admin_provider.dart';
import '../models/statistics_model.dart';
import '../../resources/models/categorie_model.dart';
import '../../resources/providers/ressource_provider.dart';

class AdminPage extends ConsumerStatefulWidget {
  const AdminPage({super.key});
  @override
  ConsumerState<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends ConsumerState<AdminPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Administration'),
        bottom: TabBar(
          controller: _tabCtrl,
          tabs: const [
            Tab(icon: Icon(Icons.people_outline), text: 'Utilisateurs'),
            Tab(icon: Icon(Icons.category_outlined), text: 'Categories'),
            Tab(icon: Icon(Icons.article_outlined), text: 'Ressources'),
            Tab(icon: Icon(Icons.bar_chart), text: 'Stats'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _UsersTab(),
          _CategoriesTab(),
          _RessourcesTab(),
          _StatsTab(),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════
//  Onglet Utilisateurs
// ═══════════════════════════════════════════

class _UsersTab extends ConsumerWidget {
  const _UsersTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final users = ref.watch(adminUsersProvider);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(adminUsersProvider),
      child: users.when(
        data: (list) {
          if (list.isEmpty) {
            return const EmptyStateWidget(
              icon: Icons.people_outline,
              title: 'Aucun utilisateur',
              subtitle: 'Aucun utilisateur trouve.',
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            itemBuilder: (_, i) => _UserTile(user: list[i]),
          );
        },
        loading: () => const AppLoadingWidget(message: 'Chargement...'),
        error: (e, _) => AppErrorWidget(
          error: e,
          onRetry: () => ref.invalidate(adminUsersProvider),
        ),
      ),
    );
  }
}

class _UserTile extends ConsumerWidget {
  final Utilisateur user;
  const _UserTile({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: user.isActive
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.error.withValues(alpha: 0.1),
          child: Text(
            user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : '?',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: user.isActive ? AppColors.primary : AppColors.error,
            ),
          ),
        ),
        title: Text(
          user.fullName,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.email,
                style: TextStyle(
                    fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 2),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.info.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    user.roleLabel,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.info,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: (user.isActive
                            ? AppColors.success
                            : AppColors.error)
                        .withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    user.isActive ? 'Actif' : 'Inactif',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: user.isActive
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (action) => _handleAction(context, ref, action),
          itemBuilder: (_) => [
            PopupMenuItem(
              value: 'toggle',
              child: Text(user.isActive ? 'Desactiver' : 'Activer'),
            ),
            const PopupMenuItem(
              value: 'resetPassword',
              child: Text('Reset mot de passe'),
            ),
            const PopupMenuItem(
              value: 'delete',
              child:
                  Text('Supprimer', style: TextStyle(color: AppColors.error)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleAction(
      BuildContext context, WidgetRef ref, String action) async {
    final admin = ref.read(adminActionsProvider);
    try {
      switch (action) {
        case 'toggle':
          await admin.toggleUserActive(user.id, !user.isActive);
          break;
        case 'resetPassword':
          final ctrl = TextEditingController();
          final pwd = await showDialog<String>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Nouveau mot de passe'),
              content: TextField(
                controller: ctrl,
                obscureText: true,
                decoration:
                    const InputDecoration(hintText: 'Nouveau mot de passe'),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Annuler'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(ctx, ctrl.text),
                  child: const Text('Valider'),
                ),
              ],
            ),
          );
          if (pwd != null && pwd.isNotEmpty) {
            await admin.resetUserPassword(user.id, pwd);
          }
          break;
        case 'delete':
          final confirm = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Supprimer'),
              content: Text('Supprimer ${user.fullName} ?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('Annuler'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Supprimer',
                      style: TextStyle(color: AppColors.error)),
                ),
              ],
            ),
          );
          if (confirm == true) {
            await admin.deleteUser(user.id);
          }
          break;
      }
      ref.invalidate(adminUsersProvider);
      if (context.mounted) {
        ErrorHelpers.showSuccessSnackBar(context, 'Action effectuée');
      }
    } catch (e) {
      if (context.mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }
}

// ═══════════════════════════════════════════
//  Onglet Categories
// ═══════════════════════════════════════════

class _CategoriesTab extends ConsumerWidget {
  const _CategoriesTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(categoriesProvider),
        child: categories.when(
          data: (list) {
            if (list.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.category_outlined,
                title: 'Aucune categorie',
                subtitle: 'Ajoutez des categories pour classer les ressources.',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (_, i) {
                final cat = list[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor:
                          AppColors.primary.withValues(alpha: 0.1),
                      child: const Icon(Icons.label_outline,
                          color: AppColors.primary),
                    ),
                    title: Text(cat.nom,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit_outlined, size: 20),
                          onPressed: () =>
                              _showCategorieDialog(context, ref, cat),
                        ),
                        IconButton(
                          icon: Icon(Icons.delete_outline,
                              size: 20, color: AppColors.error),
                          onPressed: () => _deleteCategorie(context, ref, cat),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const AppLoadingWidget(message: 'Chargement...'),
          error: (e, _) => AppErrorWidget(
            error: e,
            onRetry: () => ref.invalidate(categoriesProvider),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCategorieDialog(context, ref, null),
        child: const Icon(Icons.add),
      ),
    );
  }

  Future<void> _showCategorieDialog(
      BuildContext context, WidgetRef ref, Categorie? existing) async {
    final ctrl = TextEditingController(text: existing?.nom ?? '');
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(existing != null
            ? 'Modifier la categorie'
            : 'Nouvelle categorie'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(hintText: 'Nom de la categorie'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: const Text('Valider'),
          ),
        ],
      ),
    );
    if (name != null && name.isNotEmpty) {
      try {
        final admin = ref.read(adminActionsProvider);
        if (existing != null) {
          await admin.updateCategorie(
              existing.id, CreateCategorieDto(nom: name));
        } else {
          await admin.createCategorie(CreateCategorieDto(nom: name));
        }
        ref.invalidate(categoriesProvider);
      } catch (_) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erreur')),
          );
        }
      }
    }
  }

  Future<void> _deleteCategorie(
      BuildContext context, WidgetRef ref, Categorie cat) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer'),
        content: Text('Supprimer la categorie "${cat.nom}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Supprimer',
                style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await ref.read(adminActionsProvider).deleteCategorie(cat.id);
        ref.invalidate(categoriesProvider);
      } catch (e) {
        if (context.mounted) {
          ErrorHelpers.showErrorSnackBar(context, e);
        }
      }
    }
  }
}

// ═══════════════════════════════════════════
//  Onglet Ressources
// ═══════════════════════════════════════════

class _RessourcesTab extends ConsumerStatefulWidget {
  const _RessourcesTab();

  @override
  ConsumerState<_RessourcesTab> createState() => _RessourcesTabState();
}

class _RessourcesTabState extends ConsumerState<_RessourcesTab> {
  String? _statut;

  @override
  Widget build(BuildContext context) {
    final ressources = ref.watch(adminRessourcesProvider(_statut));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: DropdownButtonFormField<String?>(
            value: _statut,
            decoration: const InputDecoration(
              labelText: 'Filtre statut',
              isDense: true,
            ),
            items: const [
              DropdownMenuItem(value: null, child: Text('Tous')),
              DropdownMenuItem(value: 'Publiee', child: Text('Publiées')),
              DropdownMenuItem(
                  value: 'EnValidation', child: Text('En validation')),
              DropdownMenuItem(value: 'Rejetee', child: Text('Rejetées')),
              DropdownMenuItem(value: 'Archivee', child: Text('Archivées')),
            ],
            onChanged: (value) => setState(() => _statut = value),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(adminRessourcesProvider(_statut)),
            child: ressources.when(
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.article_outlined,
                    title: 'Aucune ressource',
                    subtitle: 'Aucune ressource pour ce filtre.',
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  itemBuilder: (_, i) {
                    final ressource = list[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text(
                          ressource.titre,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          '${ressource.categorie} • ${ressource.statutLabel}',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (action) =>
                              _handleRessourceAction(context, ressource.id, action),
                          itemBuilder: (_) => const [
                            PopupMenuItem(
                              value: 'view',
                              child: Text('Voir'),
                            ),
                            PopupMenuItem(
                              value: 'suspend',
                              child: Text('Suspendre'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const AppLoadingWidget(message: 'Chargement...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: () => ref.invalidate(adminRessourcesProvider(_statut)),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _handleRessourceAction(
      BuildContext context, int id, String action) async {
    final admin = ref.read(adminActionsProvider);
    try {
      switch (action) {
        case 'view':
          context.push('/ressources/$id');
          return;
        case 'suspend':
          await admin.suspendRessource(id);
          ref.invalidate(adminRessourcesProvider(_statut));
          if (context.mounted) {
            ErrorHelpers.showSuccessSnackBar(context, 'Ressource suspendue');
          }
          return;
      }
    } catch (e) {
      if (context.mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }
}

// ═══════════════════════════════════════════
//  Onglet Statistiques
// ═══════════════════════════════════════════

class _StatsTab extends ConsumerWidget {
  const _StatsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(adminStatisticsProvider);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(adminStatisticsProvider),
      child: stats.when(
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _StatsSection(
              title: 'Résumé',
              children: [
                _StatRow('Ressources', data.resume.totalRessources),
                _StatRow('Publiées', data.resume.ressourcesPubliees),
                _StatRow('En validation', data.resume.ressourcesEnValidation),
                _StatRow('Archivées', data.resume.ressourcesArchivees),
                _StatRow('Utilisateurs', data.resume.totalUtilisateurs),
                _StatRow('Utilisateurs actifs', data.resume.utilisateursActifs),
                _StatRow('Comptes créés (période)', data.resume.comptesCreesPeriode),
                _StatRow('Favoris', data.resume.favoris),
                _StatRow('Commentaires', data.resume.commentaires),
                _StatRow('Exploitations', data.resume.exploitations),
                _StatRow('Sauvegardes', data.resume.sauvegardes),
                _StatRow('Activités démarrées', data.resume.activitesDemarrees),
                _StatRow('Invitations envoyées', data.resume.invitationsEnvoyees),
                _StatRow('Invitations acceptées', data.resume.invitationsAcceptees),
                _StatRow('Messages discussion', data.resume.messagesDiscussion),
              ],
            ),
            const SizedBox(height: 16),
            _StatsBreakdown(
              title: 'Créations par catégorie',
              items: data.creationsParCategorie,
            ),
            const SizedBox(height: 16),
            _StatsBreakdown(
              title: 'Créations par format',
              items: data.creationsParFormat,
            ),
            const SizedBox(height: 16),
            _StatsBreakdown(
              title: 'Répartition visibilités',
              items: data.repartitionVisibilite,
            ),
          ],
        ),
        loading: () => const AppLoadingWidget(message: 'Chargement...'),
        error: (e, _) => AppErrorWidget(
          error: e,
          onRetry: () => ref.invalidate(adminStatisticsProvider),
        ),
      ),
    );
  }
}

class _StatsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _StatsSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final int value;

  const _StatRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text('$value', style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _StatsBreakdown extends StatelessWidget {
  final String title;
  final List<StatisticsBreakdownItem> items;

  const _StatsBreakdown({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            if (items.isEmpty)
              const Text('Aucune donnée disponible.'),
            ...items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Expanded(child: Text(item.label)),
                      Text('${item.value}'),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
