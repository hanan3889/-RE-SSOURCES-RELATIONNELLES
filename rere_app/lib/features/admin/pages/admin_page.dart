import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../models/utilisateur_model.dart';
import '../providers/admin_provider.dart';
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
    _tabCtrl = TabController(length: 2, vsync: this);
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
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _UsersTab(),
          _CategoriesTab(),
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
