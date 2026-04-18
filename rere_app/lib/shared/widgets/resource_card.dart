import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../features/resources/models/ressource_model.dart';
import 'package:intl/intl.dart';

/// Carte de ressource réutilisable.
class ResourceCard extends StatelessWidget {
  final Ressource ressource;
  final VoidCallback? onTap;
  final VoidCallback? onFavorite;
  final bool isFavorite;

  const ResourceCard({
    super.key,
    required this.ressource,
    this.onTap,
    this.onFavorite,
    this.isFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Catégorie + Format
              Row(
                children: [
                  _Chip(label: ressource.categorie, color: AppColors.primary),
                  const SizedBox(width: 8),
                  _Chip(
                    label: ressource.format,
                    color: AppColors.secondary,
                  ),
                  const Spacer(),
                  if (onFavorite != null)
                    GestureDetector(
                      onTap: onFavorite,
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        size: 20,
                        color: isFavorite ? AppColors.error : AppColors.textHint,
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
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              // Description
              Text(
                ressource.description,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              // Auteur + Date
              Row(
                children: [
                  Icon(Icons.person_outline,
                      size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Text(
                    ressource.auteur,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.access_time,
                      size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd/MM/yyyy').format(ressource.dateCreation),
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
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

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
