import 'package:flutter/material.dart';
import '../../config/theme.dart';

/// Widget de chargement centré.
class AppLoadingWidget extends StatelessWidget {
  final String? message;
  const AppLoadingWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!, style: TextStyle(color: AppColors.textSecondary)),
          ],
        ],
      ),
    );
  }
}
