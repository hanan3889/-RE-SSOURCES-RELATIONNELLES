import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/providers/profile_provider.dart';
import '../../mon_espace/providers/mon_espace_provider.dart';
import '../../resources/models/ressource_model.dart';
import '../../resources/providers/ressource_provider.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isChangingPassword = false;
  final _currentPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _currentPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    // Garde d'authentification — réactif au changement d'état
    if (!auth.isAuthenticated) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_outline, size: 64,
                    color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 20),
                const Text(
                  'Connexion requise',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Connectez-vous pour accéder à votre profil.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => context.push('/login'),
                  icon: const Icon(Icons.login),
                  label: const Text('Se connecter'),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.push('/register'),
                  child: const Text('Créer un compte'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // ── Header gradient ──
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF1A56DB), Color(0xFF7C3AED)],
                ),
              ),
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                left: 20,
                right: 20,
                bottom: 24,
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.white24,
                    child: Text(
                      '${user?.prenom[0] ?? '?'}${user?.nom[0] ?? ''}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.fullName ?? 'Utilisateur',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _roleLabel(user?.role ?? 'citoyen'),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Stats rapides ──
          SliverToBoxAdapter(
            child: _buildStatsBar(),
          ),

          // ── Tab bar ──
          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyTabBarDelegate(
              TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                labelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                tabAlignment: TabAlignment.start,
                tabs: const [
                  Tab(text: 'Identité & Compte'),
                  Tab(text: 'Progression'),
                  Tab(text: 'Contributions'),
                  Tab(text: 'Interactions'),
                ],
              ),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildIdentityTab(),
            _buildProgressionTab(),
            _buildContributionsTab(),
            _buildInteractionsTab(),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════
  // STATS BAR
  // ═══════════════════════════════════════════
  Widget _buildStatsBar() {
    final progression = ref.watch(progressionProvider);
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      child: progression.when(
        data: (stats) => SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _MiniStat(
                  value: '${stats.nbMesRessources}',
                  label: 'Ressources',
                  color: AppColors.primary),
              _MiniStat(
                  value: '${stats.nbExploitees}',
                  label: 'Exploitées',
                  color: AppColors.success),
              _MiniStat(
                  value: '${stats.nbPubliees}',
                  label: 'Publications',
                  color: const Color(0xFF7C3AED)),
              _MiniStat(
                  value: '${stats.nbFavoris}',
                  label: 'Favoris',
                  color: const Color(0xFFEAB308)),
              _MiniStat(
                  value: '${stats.nbSauvegardees}',
                  label: 'Sauvegardés',
                  color: const Color(0xFFEA580C)),
            ],
          ),
        ),
        loading: () => const SizedBox(
          height: 60,
          child: Center(child: CircularProgressIndicator()),
        ),
        error: (_, __) => const SizedBox.shrink(),
      ),
    );
  }

  // ═══════════════════════════════════════════
  // TAB 1 : IDENTITÉ & COMPTE
  // ═══════════════════════════════════════════
  Widget _buildIdentityTab() {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final userId = user?.idUtilisateur;
    final profile =
        userId != null ? ref.watch(userProfileProvider(userId)) : null;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ── Informations personnelles ──
        _SectionCard(
          title: 'Informations personnelles',
          icon: Icons.person_outline,
          child: Column(
            children: [
              _InfoRow(label: 'Prénom', value: user?.prenom ?? ''),
              _InfoRow(label: 'Nom', value: user?.nom ?? ''),
              _InfoRow(label: 'Email', value: user?.email ?? ''),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── Statut du compte ──
        _SectionCard(
          title: 'Statut du compte',
          icon: Icons.verified_user_outlined,
          child: Column(
            children: [
              _InfoRow(
                  label: 'Rôle',
                  value: _roleLabel(user?.role ?? 'citoyen')),
              if (profile != null)
                profile.when(
                  data: (p) => Column(
                    children: [
                      _InfoRow(
                        label: 'Date d\'inscription',
                        value: DateFormat('dd MMMM yyyy', 'fr_FR')
                            .format(p.createdAt),
                      ),
                      _InfoRow(
                        label: 'Compte actif',
                        value: p.isActive ? 'Oui' : 'Non',
                      ),
                    ],
                  ),
                  loading: () => const Padding(
                    padding: EdgeInsets.all(8),
                    child: Center(
                        child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Vous avez accès à tous les contenus et fonctionnalités en tant que citoyen connecté.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.info,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── Sécurité ──
        _SectionCard(
          title: 'Paramètres de sécurité',
          icon: Icons.lock_outline,
          child: _buildSecuritySection(userId),
        ),
        const SizedBox(height: 16),

        // ── RGPD ──
        _SectionCard(
          title: 'Vos droits RGPD',
          icon: Icons.shield_outlined,
          borderColor: const Color(0xFFFBBF24),
          child: Column(
            children: [
              _ActionTile(
                icon: Icons.download_outlined,
                label: 'Exporter mes données',
                color: AppColors.success,
                onTap: () {
                  ErrorHelpers.showSuccessSnackBar(
                      context, 'Préparation de l\'export de vos données...');
                },
              ),
              const SizedBox(height: 8),
              _ActionTile(
                icon: Icons.delete_forever_outlined,
                label: 'Supprimer mon compte',
                color: AppColors.error,
                onTap: () => _confirmDeleteAccount(userId),
              ),
              const SizedBox(height: 8),
              Text(
                'Attention : Ces actions sont irréversibles. Veuillez les utiliser avec prudence.',
                style: TextStyle(fontSize: 11, color: AppColors.textHint),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── Déconnexion ──
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () => _confirmLogout(),
            icon: const Icon(Icons.logout, color: AppColors.error),
            label: const Text('Se déconnecter',
                style: TextStyle(color: AppColors.error)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.error),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildSecuritySection(int? userId) {
    if (!_isChangingPassword) {
      return InkWell(
        onTap: () => setState(() => _isChangingPassword = true),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Modifier mon mot de passe',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              const Icon(Icons.arrow_forward_ios,
                  size: 14, color: AppColors.textSecondary),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _currentPasswordCtrl,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Mot de passe actuel',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _newPasswordCtrl,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Nouveau mot de passe',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmPasswordCtrl,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Confirmer le nouveau',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () => _submitPasswordChange(userId),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                ),
                child: const Text('Mettre à jour'),
              ),
            ),
            const SizedBox(width: 12),
            OutlinedButton(
              onPressed: () {
                setState(() => _isChangingPassword = false);
                _currentPasswordCtrl.clear();
                _newPasswordCtrl.clear();
                _confirmPasswordCtrl.clear();
              },
              child: const Text('Annuler'),
            ),
          ],
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════
  // TAB 2 : PROGRESSION
  // ═══════════════════════════════════════════
  Widget _buildProgressionTab() {
    final mesFavoris = ref.watch(mesFavorisProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionCard(
          title: 'Mes favoris',
          icon: Icons.favorite_outline,
          child: mesFavoris.when(
            data: (list) {
              if (list.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Aucun favori pour le moment.',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 14),
                  ),
                );
              }
              return Column(
                children: list
                    .map((r) => _FavoriteItem(
                          ressource: r,
                          onTap: () =>
                              context.push('/ressources/${r.id}'),
                          onRemove: () => _removeFavorite(r.id),
                        ))
                    .toList(),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => InlineSectionError(
              error: e,
              onRetry: () => ref.invalidate(mesFavorisProvider),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════
  // TAB 3 : CONTRIBUTIONS
  // ═══════════════════════════════════════════
  Widget _buildContributionsTab() {
    final mesRessources = ref.watch(mesRessourcesProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // CTA Créer
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1A56DB), Color(0xFF7C3AED)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              const Text(
                'Partagez votre expertise !',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Créez une nouvelle ressource pour aider la communauté',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.push('/ressources/create'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                ),
                child: const Text('Créer une nouvelle ressource'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Mes publications
        _SectionCard(
          title: 'Mes publications',
          icon: Icons.article_outlined,
          child: mesRessources.when(
            data: (list) {
              if (list.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Aucune publication trouvée pour ce compte.',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 14),
                  ),
                );
              }
              return Column(
                children: list.map((r) => _PublicationItem(
                  ressource: r,
                  onTap: () => context.push('/ressources/${r.id}'),
                )).toList(),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => InlineSectionError(
              error: e,
              onRetry: () => ref.invalidate(mesRessourcesProvider),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════
  // TAB 4 : INTERACTIONS
  // ═══════════════════════════════════════════
  Widget _buildInteractionsTab() {
    final mesCommentaires = ref.watch(mesCommentairesProvider);
    final invitations = ref.watch(pendingInvitationsProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Mes commentaires
        _SectionCard(
          title: 'Mes commentaires',
          icon: Icons.chat_bubble_outline,
          child: mesCommentaires.when(
            data: (list) {
              if (list.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Vous n\'avez encore écrit aucun commentaire.',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 14),
                  ),
                );
              }
              return Column(
                children: list.map((c) => _CommentItem(
                  commentaire: c,
                  onTap: () =>
                      context.push('/ressources/${c.idRessource}'),
                  onDelete: () => _deleteComment(c.idCommentaire),
                )).toList(),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => InlineSectionError(
              error: e,
              onRetry: () => ref.invalidate(mesCommentairesProvider),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Invitations reçues
        _SectionCard(
          title: 'Invitations reçues',
          icon: Icons.mail_outline,
          child: invitations.when(
            data: (list) {
              if (list.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Aucune invitation en attente.',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 14),
                  ),
                );
              }
              return Column(
                children: list.map((inv) => _InvitationItem(
                  invitation: inv,
                  onAccept: () =>
                      _respondToInvitation(inv, true),
                  onDecline: () =>
                      _respondToInvitation(inv, false),
                )).toList(),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => InlineSectionError(
              error: e,
              onRetry: () => ref.invalidate(pendingInvitationsProvider),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════

  Future<void> _confirmLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Déconnexion'),
        content:
            const Text('Voulez-vous vraiment vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await ref.read(authProvider.notifier).logout();
      if (mounted) context.go('/home');
    }
  }

  Future<void> _confirmDeleteAccount(int? userId) async {
    if (userId == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer mon compte'),
        content: const Text(
            'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await ref.read(profileActionsProvider).deleteAccount(userId);
        await ref.read(authProvider.notifier).logout();
        if (mounted) context.go('/home');
      } catch (e) {
        if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }

  Future<void> _submitPasswordChange(int? userId) async {
    if (userId == null) return;
    if (_newPasswordCtrl.text != _confirmPasswordCtrl.text) {
      _showValidationError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (_newPasswordCtrl.text.length < 8) {
      _showValidationError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      await ref
          .read(profileActionsProvider)
          .changePassword(userId, _newPasswordCtrl.text);
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(
            context, 'Mot de passe modifié avec succès !');
        setState(() => _isChangingPassword = false);
        _currentPasswordCtrl.clear();
        _newPasswordCtrl.clear();
        _confirmPasswordCtrl.clear();
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    }
  }

  Future<void> _removeFavorite(int ressourceId) async {
    try {
      await ref.read(ressourceActionsProvider).removeFavori(ressourceId);
      ref.invalidate(mesFavorisProvider);
      ref.invalidate(progressionProvider);
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(context, 'Favori retiré.');
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    }
  }

  Future<void> _deleteComment(int commentId) async {
    try {
      await ref.read(profileActionsProvider).deleteComment(commentId);
      ref.invalidate(mesCommentairesProvider);
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(
            context, 'Commentaire supprimé.');
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    }
  }

  Future<void> _respondToInvitation(
      InboxMessage invitation, bool accept) async {
    try {
      final result = await ref
          .read(profileActionsProvider)
          .respondToInvitation(invitation.idMessage, accept);
      ref.invalidate(pendingInvitationsProvider);
      ref.invalidate(inboxProvider);
      if (mounted) {
        if (accept && result.idRessource != null) {
          context.push('/ressources/${result.idRessource}');
        } else {
          ErrorHelpers.showSuccessSnackBar(
              context,
              accept
                  ? 'Invitation acceptée.'
                  : 'Invitation refusée.');
        }
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    }
  }

  void _showValidationError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning_amber_rounded,
                  color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 4),
        ),
      );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'super_administrateur':
        return 'Super Administrateur';
      case 'administrateur':
        return 'Administrateur';
      case 'moderateur':
        return 'Modérateur';
      default:
        return 'Citoyen';
    }
  }
}

// ═══════════════════════════════════════════════
// COMPOSANTS RÉUTILISABLES
// ═══════════════════════════════════════════════

/// Delegate pour tab bar sticky.
class _StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _StickyTabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.surface,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(covariant _StickyTabBarDelegate oldDelegate) =>
      tabBar != oldDelegate.tabBar;
}

/// Mini stat dans le header.
class _MiniStat extends StatelessWidget {
  final String value;
  final String label;
  final Color color;
  const _MiniStat(
      {required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Card de section avec titre et bordure.
class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  final Color? borderColor;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.child,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: borderColor ?? AppColors.border,
          width: borderColor != null ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

/// Ligne d'info label/value.
class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Tuile cliquable pour les actions RGPD.
class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: color),
                const SizedBox(width: 10),
                Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: color,
                  ),
                ),
              ],
            ),
            Icon(Icons.arrow_forward_ios, size: 14, color: color),
          ],
        ),
      ),
    );
  }
}

/// Item favori dans l'onglet progression.
class _FavoriteItem extends StatelessWidget {
  final Ressource ressource;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  const _FavoriteItem({
    required this.ressource,
    required this.onTap,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFFDF2F8),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFFBCFE8)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ressource.titre,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ressource.categorie,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: onRemove,
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFFDB2777),
                  textStyle: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600),
                ),
                child: const Text('Retirer'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Item de publication dans l'onglet contributions.
class _PublicationItem extends StatelessWidget {
  final Ressource ressource;
  final VoidCallback onTap;

  const _PublicationItem({
    required this.ressource,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ressource.titre,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _StatusBadge(statut: ressource.statutLabel),
                  const SizedBox(width: 12),
                  Text(
                    DateFormat('dd/MM/yyyy').format(ressource.dateCreation),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Badge de statut coloré.
class _StatusBadge extends StatelessWidget {
  final String statut;
  const _StatusBadge({required this.statut});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    if (statut.contains('Publiée')) {
      bgColor = const Color(0xFFDCFCE7);
      textColor = const Color(0xFF15803D);
    } else if (statut.contains('validation')) {
      bgColor = const Color(0xFFFEF9C3);
      textColor = const Color(0xFFA16207);
    } else {
      bgColor = const Color(0xFFF1F5F9);
      textColor = const Color(0xFF64748B);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        statut,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}

/// Item commentaire dans l'onglet interactions.
class _CommentItem extends StatelessWidget {
  final MesCommentaire commentaire;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _CommentItem({
    required this.commentaire,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      commentaire.titreRessource,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  GestureDetector(
                    onTap: onDelete,
                    child: const Icon(Icons.delete_outline,
                        size: 16, color: AppColors.error),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('dd/MM/yyyy').format(commentaire.dateCreation),
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textHint,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                commentaire.contenu,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textPrimary,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Item invitation dans l'onglet interactions.
class _InvitationItem extends StatelessWidget {
  final InboxMessage invitation;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const _InvitationItem({
    required this.invitation,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF5F3FF),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFDDD6FE), width: 2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              invitation.titreRessource != null
                  ? 'Invitation: ${invitation.titreRessource}'
                  : 'Invitation à une ressource',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'De : ${invitation.auteurFullName}',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('dd/MM/yyyy').format(invitation.dateCreation),
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text('Accepter',
                        style: TextStyle(fontSize: 13)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onDecline,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text('Refuser',
                        style: TextStyle(fontSize: 13)),
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
