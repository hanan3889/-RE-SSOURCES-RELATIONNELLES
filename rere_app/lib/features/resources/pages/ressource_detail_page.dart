import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/error/api_exception.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../auth/providers/auth_provider.dart';
import '../../mon_espace/models/progression_model.dart';
import '../../mon_espace/providers/mon_espace_provider.dart';
import '../models/commentaire_model.dart';
import '../providers/ressource_provider.dart';

class RessourceDetailPage extends ConsumerStatefulWidget {
  final int ressourceId;
  const RessourceDetailPage({super.key, required this.ressourceId});

  @override
  ConsumerState<RessourceDetailPage> createState() =>
      _RessourceDetailPageState();
}

class _RessourceDetailPageState extends ConsumerState<RessourceDetailPage> {
  final _commentCtrl = TextEditingController();
  bool _isFavorite = false;
  bool _isSavedForLater = false;
  bool _isExploitee = false;
  bool _sendingComment = false;
  bool _loadingSauvegarde = false;
  bool _loadingExploitation = false;
  bool _progressionLoaded = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProgressionStatuses();
    });
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _toggleFavorite() async {
    final actions = ref.read(ressourceActionsProvider);
    try {
      if (_isFavorite) {
        await actions.removeFavori(widget.ressourceId);
      } else {
        await actions.addFavori(widget.ressourceId);
      }
      setState(() => _isFavorite = !_isFavorite);
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }

  Future<void> _loadProgressionStatuses() async {
    if (_progressionLoaded) return;
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      setState(() {
        _progressionLoaded = true;
        _isSavedForLater = false;
        _isExploitee = false;
      });
      return;
    }

    try {
      final actions = ref.read(progressionActionsProvider);
      final results = await Future.wait([
        actions.getSauvegardeStatus(widget.ressourceId),
        actions.getExploitationStatus(widget.ressourceId),
      ]);
      if (!mounted) return;
      final sauvegarde = results[0] as SauvegardeStatus;
      final exploitation = results[1] as ExploitationStatus;
      setState(() {
        _progressionLoaded = true;
        _isSavedForLater = sauvegarde.sauvegardee;
        _isExploitee = exploitation.exploitee;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _progressionLoaded = true;
      });
    }
  }

  Future<void> _toggleSauvegarde() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      _showSuccessSnackBar('Veuillez vous connecter pour mettre de côté.');
      return;
    }
    if (_loadingSauvegarde) return;
    setState(() => _loadingSauvegarde = true);
    try {
      final actions = ref.read(progressionActionsProvider);
      final nextValue = !_isSavedForLater;
      final res = await actions.setSauvegardeStatus(
          widget.ressourceId, nextValue);
      if (!mounted) return;
      setState(() => _isSavedForLater = res.sauvegardee);
      _showSuccessSnackBar(
        res.sauvegardee
            ? 'Ressource mise de côté.'
            : 'Ressource retirée de la mise de côté.',
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final apiErr = e.error;
      if (e.response?.statusCode == 404 ||
          (apiErr is ApiException && apiErr.type == ApiErrorType.notFound)) {
        _showSuccessSnackBar('Impossible d\'effectuer cette action. Vérifiez que le serveur est bien lancé.');
      } else {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    } finally {
      if (mounted) setState(() => _loadingSauvegarde = false);
    }
  }

  Future<void> _toggleExploitation() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      _showSuccessSnackBar('Veuillez vous connecter pour marquer exploitée.');
      return;
    }
    if (_loadingExploitation) return;
    setState(() => _loadingExploitation = true);
    try {
      final actions = ref.read(progressionActionsProvider);
      final nextValue = !_isExploitee;
      final res = await actions.setExploitationStatus(
          widget.ressourceId, nextValue);
      if (!mounted) return;
      setState(() => _isExploitee = res.exploitee);
      _showSuccessSnackBar(
        res.exploitee
            ? 'Ressource marquée comme exploitée.'
            : 'Ressource marquée comme non exploitée.',
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final apiErr = e.error;
      if (e.response?.statusCode == 404 ||
          (apiErr is ApiException && apiErr.type == ApiErrorType.notFound)) {
        _showSuccessSnackBar('Impossible d\'effectuer cette action. Vérifiez que le serveur est bien lancé.');
      } else {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    } catch (e) {
      if (mounted) ErrorHelpers.showErrorSnackBar(context, e);
    } finally {
      if (mounted) setState(() => _loadingExploitation = false);
    }
  }

  void _showSuccessSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _submitComment() async {
    final text = _commentCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _sendingComment = true);
    try {
      await ref.read(ressourceActionsProvider).addComment(
            widget.ressourceId,
            CreateCommentaireDto(contenu: text),
          );
      _commentCtrl.clear();
      ref.invalidate(commentairesProvider(widget.ressourceId));
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    } finally {
      if (mounted) setState(() => _sendingComment = false);
    }
  }

  Future<void> _deleteComment(int commentId) async {
    try {
      await ref
          .read(ressourceActionsProvider)
          .deleteComment(widget.ressourceId, commentId);
      ref.invalidate(commentairesProvider(widget.ressourceId));
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }

  Future<void> _replyToComment(int commentId) async {
    final ctrl = TextEditingController();
    final content = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Répondre'),
        content: TextField(
          controller: ctrl,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Votre réponse...'
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text),
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );

    if (content == null || content.trim().isEmpty) return;
    try {
      await ref.read(ressourceActionsProvider).replyComment(
            commentId,
            CreateCommentaireDto(contenu: content.trim()),
          );
      ref.invalidate(commentairesProvider(widget.ressourceId));
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(context, 'Réponse envoyée');
      }
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ressource = ref.watch(ressourceDetailProvider(widget.ressourceId));
    final commentaires =
        ref.watch(commentairesProvider(widget.ressourceId));
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: ressource.when(
        data: (r) => CustomScrollView(
          slivers: [
            // App bar avec image gradient
            SliverAppBar(
              expandedHeight: 180,
              pinned: true,
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              titleTextStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              flexibleSpace: FlexibleSpaceBar(
                centerTitle: false,
                titlePadding:
                    const EdgeInsetsDirectional.only(start: 52, bottom: 12, end: 52),
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.primaryDark, AppColors.primary],
                    ),
                  ),
                  child: Center(
                    child: Icon(
                      _iconForFormat(r.format),
                      size: 56,
                      color: Colors.white30,
                    ),
                  ),
                ),
                title: Text(
                  r.titre,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
              actions: [
                if (auth.isAuthenticated)
                  IconButton(
                    icon: Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: _isFavorite ? AppColors.error : null,
                    ),
                    onPressed: _toggleFavorite,
                  ),
              ],
            ),

            // Contenu
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badges
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _Badge(label: r.categorie, color: AppColors.primary),
                        _Badge(label: r.format, color: AppColors.secondary),
                        _Badge(
                          label: r.visibiliteLabel,
                          color: AppColors.info,
                        ),
                        _Badge(
                          label: r.statutLabel,
                          color: _colorForStatut(r.statutLabel),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Titre complet de la ressource
                    SizedBox(
                      width: double.infinity,
                      child: Text(
                        r.titre,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1.3,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (auth.isAuthenticated)
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () =>
                                context.push('/ressources/${r.id}/discussion'),
                            icon: const Icon(Icons.forum_outlined),
                            label: const Text('Discussion'),
                          ),
                          OutlinedButton.icon(
                            onPressed:
                                _loadingSauvegarde ? null : _toggleSauvegarde,
                            icon: Icon(
                              _isSavedForLater
                                  ? Icons.bookmark
                                  : Icons.bookmark_border,
                              color: const Color(0xFFF59E0B),
                            ),
                            label: Text(
                              _isSavedForLater
                                  ? 'Annuler la mise de côté'
                                  : 'Mettre de côté',
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFF59E0B),
                              side: const BorderSide(color: Color(0xFFF59E0B)),
                            ),
                          ),
                          OutlinedButton.icon(
                            onPressed: _loadingExploitation
                                ? null
                                : _toggleExploitation,
                            icon: Icon(
                              _isExploitee
                                  ? Icons.verified
                                  : Icons.verified_outlined,
                              color: const Color(0xFF000091),
                            ),
                            label: Text(
                              _isExploitee
                                  ? 'Marquer non exploitée'
                                  : 'Marquer exploitée',
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF000091),
                              side: const BorderSide(color: Color(0xFF000091)),
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 20),

                    // Auteur + date
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor:
                              AppColors.primary.withValues(alpha: 0.1),
                          child: Text(
                            r.auteur.isNotEmpty
                                ? r.auteur[0].toUpperCase()
                                : '?',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                r.auteur,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                DateFormat('dd MMMM yyyy', 'fr_FR')
                                    .format(r.dateCreation),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Description
                    Text(
                      r.description,
                      style: const TextStyle(
                        fontSize: 15,
                        height: 1.7,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Section commentaires
                    Row(
                      children: [
                        const Icon(Icons.chat_bubble_outline, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'Commentaires',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Champ commentaire
                    if (auth.isAuthenticated)
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _commentCtrl,
                              decoration: const InputDecoration(
                                hintText: 'Écrire un commentaire...',
                                isDense: true,
                              ),
                              maxLines: 1,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (_) => _submitComment(),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton.filled(
                            onPressed:
                                _sendingComment ? null : _submitComment,
                            icon: _sendingComment
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Icon(Icons.send, size: 18),
                          ),
                        ],
                      ),
                    const SizedBox(height: 16),

                    // Liste commentaires
                    commentaires.when(
                      data: (list) {
                        if (list.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                'Aucun commentaire pour le moment.',
                                style: TextStyle(
                                    color: AppColors.textSecondary),
                              ),
                            ),
                          );
                        }
                        return ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: list.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 24),
                          itemBuilder: (_, i) {
                            final c = list[i];
                            final canDelete = auth.isAuthenticated &&
                                (auth.user!.idUtilisateur ==
                                        c.idUtilisateur ||
                                    auth.user!.isModerator);
                            return _CommentTile(
                              commentaire: c,
                              canDelete: canDelete,
                              onDelete: () => _deleteComment(c.id),
                              onReply: auth.isAuthenticated
                                  ? () => _replyToComment(c.id)
                                  : null,
                            );
                          },
                        );
                      },
                      loading: () => const Padding(
                        padding: EdgeInsets.all(20),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                      error: (e, _) => InlineSectionError(
                        error: e,
                        onRetry: () => ref.invalidate(
                            commentairesProvider(widget.ressourceId)),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
        loading: () => const AppLoadingWidget(message: 'Chargement...'),
        error: (e, _) => AppErrorWidget(
          error: e,
          onRetry: () =>
              ref.invalidate(ressourceDetailProvider(widget.ressourceId)),
        ),
      ),
    );
  }

  IconData _iconForFormat(String format) {
    final f = format.toLowerCase();
    if (f.contains('video')) return Icons.play_circle_outline;
    if (f.contains('audio') || f.contains('podcast')) return Icons.headphones;
    if (f.contains('image') || f.contains('photo')) return Icons.image;
    if (f.contains('pdf') || f.contains('doc')) return Icons.description;
    return Icons.article;
  }

  Color _colorForStatut(String statut) {
    if (statut.contains('Publiée')) return AppColors.success;
    if (statut.contains('validation')) return AppColors.warning;
    if (statut.contains('Rejetée')) return AppColors.error;
    if (statut.contains('Archivée')) return AppColors.textSecondary;
    return AppColors.textHint;
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  final Commentaire commentaire;
  final bool canDelete;
  final VoidCallback? onReply;
  final VoidCallback onDelete;

  const _CommentTile({
    required this.commentaire,
    required this.canDelete,
    this.onReply,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 16,
          backgroundColor: AppColors.surfaceVariant,
          child: Text(
            commentaire.fullName.isNotEmpty
                ? commentaire.fullName[0].toUpperCase()
                : '?',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    commentaire.fullName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    DateFormat('dd/MM/yy HH:mm')
                        .format(commentaire.dateCreation),
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textHint,
                    ),
                  ),
                  const Spacer(),
                  if (onReply != null)
                    GestureDetector(
                      onTap: onReply,
                      child: const Padding(
                        padding: EdgeInsets.only(right: 8),
                        child: Icon(Icons.reply, size: 16),
                      ),
                    ),
                  if (canDelete)
                    GestureDetector(
                      onTap: onDelete,
                      child: Icon(Icons.delete_outline,
                          size: 16, color: AppColors.error),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                commentaire.contenu,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textPrimary,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
