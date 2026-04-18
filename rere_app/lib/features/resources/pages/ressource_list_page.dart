import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/resource_card.dart';
import '../providers/ressource_provider.dart';

class RessourceListPage extends ConsumerStatefulWidget {
  final String? initialCategorie;
  const RessourceListPage({super.key, this.initialCategorie});
  @override
  ConsumerState<RessourceListPage> createState() => _RessourceListPageState();
}

class _RessourceListPageState extends ConsumerState<RessourceListPage> {
  final _searchCtrl = TextEditingController();
  String? _activeCategorie;

  @override
  void initState() {
    super.initState();
    _activeCategorie = widget.initialCategorie;
  }

  @override
  void didUpdateWidget(covariant RessourceListPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialCategorie != oldWidget.initialCategorie) {
      setState(() => _activeCategorie = widget.initialCategorie);
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Use filtered provider when a category is active, otherwise all
    final allRessources = _activeCategorie != null
        ? ref.watch(ressourcesByCategorieProvider(_activeCategorie!))
        : ref.watch(allRessourcesProvider);
    final searchTerm = _searchCtrl.text.toLowerCase();

    return Scaffold(
      appBar: AppBar(
        title: Text(_activeCategorie != null
            ? 'Ressources — $_activeCategorie'
            : 'Ressources'),
      ),
      body: Column(
        children: [
          // Chip filtre catégorie active
          if (_activeCategorie != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  Chip(
                    label: Text(_activeCategorie!),
                    deleteIcon: const Icon(Icons.close, size: 18),
                    onDeleted: () {
                      setState(() => _activeCategorie = null);
                      context.go('/ressources');
                    },
                  ),
                ],
              ),
            ),
          // Barre de recherche
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher par mot-clé, titre...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Liste
          Expanded(
            child: allRessources.when(
              data: (list) {
                // Client-side filtering like the web
                final filtered = searchTerm.isEmpty
                    ? list
                    : list.where((r) {
                        return r.titre.toLowerCase().contains(searchTerm) ||
                            r.description.toLowerCase().contains(searchTerm) ||
                            r.auteur.toLowerCase().contains(searchTerm);
                      }).toList();

                if (filtered.isEmpty) {
                  return const EmptyStateWidget(
                    icon: Icons.search_off,
                    title: 'Aucune ressource trouvée',
                    subtitle: 'Essayez de modifier votre recherche.',
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async {
                      if (_activeCategorie != null) {
                        ref.invalidate(ressourcesByCategorieProvider(_activeCategorie!));
                      } else {
                        ref.invalidate(allRessourcesProvider);
                      }
                    },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ResourceCard(
                        ressource: filtered[i],
                        onTap: () =>
                            context.push('/ressources/${filtered[i].id}'),
                      ),
                    ),
                  ),
                );
              },
              loading: () => const AppLoadingWidget(message: 'Chargement...'),
              error: (e, _) => AppErrorWidget(
                error: e,
                onRetry: () {
                  if (_activeCategorie != null) {
                    ref.invalidate(ressourcesByCategorieProvider(_activeCategorie!));
                  } else {
                    ref.invalidate(allRessourcesProvider);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
