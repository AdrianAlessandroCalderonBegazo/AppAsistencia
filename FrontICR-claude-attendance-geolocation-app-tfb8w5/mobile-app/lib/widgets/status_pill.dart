import 'package:flutter/material.dart';

import '../models/attendance_mark.dart';
import '../models/correction_request.dart';
import '../theme/app_theme.dart';

/// Chip con fondo suave + texto del mismo matiz, nunca texto negro sobre color,
/// igual que las pills del panel admin.
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, required this.bg, required this.fg});

  factory StatusPill.forMark(BuildContext context, MarkStatus status) {
    final colors = context.semanticColors;
    return switch (status) {
      MarkStatus.dentroDeArea =>
        StatusPill(label: 'dentro de área', bg: colors.successBg, fg: colors.successText),
      MarkStatus.anomalia =>
        StatusPill(label: 'anomalía', bg: colors.warningBg, fg: colors.warningText),
      MarkStatus.pendienteSync =>
        StatusPill(label: 'pendiente de sincronizar', bg: colors.neutralBg, fg: colors.neutralText),
      MarkStatus.creadaPorSolicitud =>
        StatusPill(label: 'creada por solicitud', bg: colors.accentBg, fg: colors.accentText),
    };
  }

  factory StatusPill.forRequest(BuildContext context, RequestStatus status) {
    final colors = context.semanticColors;
    return switch (status) {
      RequestStatus.pendiente =>
        StatusPill(label: 'pendiente', bg: colors.warningBg, fg: colors.warningText),
      RequestStatus.aprobada =>
        StatusPill(label: 'aprobada', bg: colors.successBg, fg: colors.successText),
      RequestStatus.rechazada =>
        StatusPill(label: 'rechazada', bg: colors.dangerBg, fg: colors.dangerText),
    };
  }

  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label,
        style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
