import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../core/error/error_helpers.dart';
import '../../../shared/widgets/error_widget.dart';
import '../models/ressource_model.dart';
import '../providers/ressource_provider.dart';

class CreateRessourcePage extends ConsumerStatefulWidget {
  const CreateRessourcePage({super.key});
  @override
  ConsumerState<CreateRessourcePage> createState() =>
      _CreateRessourcePageState();
}

class _CreateRessourcePageState extends ConsumerState<CreateRessourcePage> {
  final _formKey = GlobalKey<FormState>();
  final _titreCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  String _format = 'Article';
  int _visibilite = 0; // 0=Publique, 1=Connectes, 2=Privee
  int? _selectedCategorieId;
  bool _submitting = false;

  final _formats = ['Article', 'Video', 'Audio', 'PDF', 'Image', 'Lien'];
  final _visibilites = ['Publique', 'Citoyens connectes', 'Privee'];

  @override
  void dispose() {
    _titreCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategorieId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez choisir une categorie')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      await ref.read(ressourceActionsProvider).create(
            CreateRessourceDto(
              titre: _titreCtrl.text.trim(),
              description: _descriptionCtrl.text.trim(),
              format: _format,
              visibilite: _visibilite,
              idCategorie: _selectedCategorieId!,
            ),
          );
      if (mounted) {
        ErrorHelpers.showSuccessSnackBar(
            context, 'Ressource créée avec succès !');
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ErrorHelpers.showErrorSnackBar(context, e);
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Nouvelle ressource')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Titre
              TextFormField(
                controller: _titreCtrl,
                decoration: const InputDecoration(
                  labelText: 'Titre',
                  prefixIcon: Icon(Icons.title),
                ),
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Titre requis' : null,
              ),
              const SizedBox(height: 16),

              // Description
              TextFormField(
                controller: _descriptionCtrl,
                decoration: const InputDecoration(
                  labelText: 'Description / Contenu',
                  prefixIcon: Icon(Icons.description),
                  alignLabelWithHint: true,
                ),
                maxLines: 6,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Description requise' : null,
              ),
              const SizedBox(height: 16),

              // Format
              DropdownButtonFormField<String>(
                initialValue: _format,
                decoration: const InputDecoration(
                  labelText: 'Format',
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                items: _formats
                    .map((f) =>
                        DropdownMenuItem(value: f, child: Text(f)))
                    .toList(),
                onChanged: (v) => setState(() => _format = v ?? 'Article'),
              ),
              const SizedBox(height: 16),

              // Categorie
              categories.when(
                data: (cats) => DropdownButtonFormField<int>(
                  initialValue: _selectedCategorieId,
                  decoration: const InputDecoration(
                    labelText: 'Categorie',
                    prefixIcon: Icon(Icons.label_outline),
                  ),
                  items: cats
                      .map((c) => DropdownMenuItem(
                          value: c.id, child: Text(c.nom)))
                      .toList(),
                  onChanged: (v) =>
                      setState(() => _selectedCategorieId = v),
                  validator: (v) => v == null ? 'Categorie requise' : null,
                ),
                loading: () => const SizedBox(
                  height: 56,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => InlineSectionError(
                  error: e,
                  onRetry: () => ref.invalidate(categoriesProvider),
                ),
              ),
              const SizedBox(height: 16),

              // Visibilite
              DropdownButtonFormField<int>(
                initialValue: _visibilite,
                decoration: const InputDecoration(
                  labelText: 'Visibilite',
                  prefixIcon: Icon(Icons.visibility_outlined),
                ),
                items: _visibilites
                    .asMap()
                    .entries
                    .map((e) => DropdownMenuItem(
                        value: e.key, child: Text(e.value)))
                    .toList(),
                onChanged: (v) => setState(() => _visibilite = v ?? 0),
              ),
              const SizedBox(height: 32),

              // Bouton
              SizedBox(
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: _submitting ? null : _submit,
                  icon: _submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.publish),
                  label: const Text('Publier la ressource'),
                ),
              ),
              const SizedBox(height: 16),

              // Info
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline,
                        size: 18, color: AppColors.info),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Votre ressource sera soumise a moderation avant publication.',
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
            ],
          ),
        ),
      ),
    );
  }
}
