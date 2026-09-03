import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Botón grande para la pantalla principal — pensado para tocarse varias
/// veces al día con prisa: ícono + etiqueta corta, siempre tocable
/// (el servidor decide si la marca es válida, aquí nunca se bloquea).
class MarkButton extends StatelessWidget {
  const MarkButton({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.loading = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final colors = context.semanticColors;
    return Material(
      color: Theme.of(context).cardTheme.color,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: loading ? null : onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.neutralBorder),
          ),
          padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                const SizedBox(height: 32, width: 32, child: CircularProgressIndicator(strokeWidth: 2.5))
              else
                Icon(icon, size: 32, color: colors.accentSolid),
              const SizedBox(height: 10),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
