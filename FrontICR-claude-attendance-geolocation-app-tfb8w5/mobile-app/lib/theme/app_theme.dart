import 'package:flutter/material.dart';

/// Paleta semántica compartida con el panel admin (ver admin-web/tailwind.config.js)
/// para que ambas apps se vean como el mismo sistema: cada color tiene un fondo
/// suave para pills/badges y un tono más oscuro para el texto de ese mismo matiz.
@immutable
class SemanticColors extends ThemeExtension<SemanticColors> {
  const SemanticColors({
    required this.successBg,
    required this.successText,
    required this.successSolid,
    required this.successBorder,
    required this.warningBg,
    required this.warningText,
    required this.warningSolid,
    required this.warningBorder,
    required this.dangerBg,
    required this.dangerText,
    required this.dangerSolid,
    required this.dangerBorder,
    required this.accentBg,
    required this.accentText,
    required this.accentSolid,
    required this.accentBorder,
    required this.neutralBg,
    required this.neutralText,
    required this.neutralSolid,
    required this.neutralBorder,
  });

  final Color successBg, successText, successSolid, successBorder;
  final Color warningBg, warningText, warningSolid, warningBorder;
  final Color dangerBg, dangerText, dangerSolid, dangerBorder;
  final Color accentBg, accentText, accentSolid, accentBorder;
  final Color neutralBg, neutralText, neutralSolid, neutralBorder;

  static const light = SemanticColors(
    successBg: Color(0xFFE6F6EC),
    successText: Color(0xFF166534),
    successSolid: Color(0xFF16A34A),
    successBorder: Color(0xFFBBE8C9),
    warningBg: Color(0xFFFEF7E0),
    warningText: Color(0xFF92650A),
    warningSolid: Color(0xFFEAB308),
    warningBorder: Color(0xFFFBE6A6),
    dangerBg: Color(0xFFFDECEC),
    dangerText: Color(0xFF991B1B),
    dangerSolid: Color(0xFFDC2626),
    dangerBorder: Color(0xFFF7C6C6),
    accentBg: Color(0xFFE8F0FE),
    accentText: Color(0xFF1D4ED8),
    accentSolid: Color(0xFF2563EB),
    accentBorder: Color(0xFFC3D9FB),
    neutralBg: Color(0xFFF4F4F5),
    neutralText: Color(0xFF52525B),
    neutralSolid: Color(0xFF71717A),
    neutralBorder: Color(0xFFE4E4E7),
  );

  static const dark = SemanticColors(
    successBg: Color(0xFF123321),
    successText: Color(0xFF86EFAC),
    successSolid: Color(0xFF16A34A),
    successBorder: Color(0xFF1F4A31),
    warningBg: Color(0xFF3A2F0D),
    warningText: Color(0xFFFDE68A),
    warningSolid: Color(0xFFEAB308),
    warningBorder: Color(0xFF52431A),
    dangerBg: Color(0xFF3A1414),
    dangerText: Color(0xFFFCA5A5),
    dangerSolid: Color(0xFFDC2626),
    dangerBorder: Color(0xFF54201F),
    accentBg: Color(0xFF122542),
    accentText: Color(0xFF93C5FD),
    accentSolid: Color(0xFF3B82F6),
    accentBorder: Color(0xFF1D3A63),
    neutralBg: Color(0xFF27272A),
    neutralText: Color(0xFFD4D4D8),
    neutralSolid: Color(0xFF9F9FA8),
    neutralBorder: Color(0xFF3F3F46),
  );

  @override
  SemanticColors copyWith() => this;

  @override
  SemanticColors lerp(ThemeExtension<SemanticColors>? other, double t) => this;
}

class AppTheme {
  AppTheme._();

  static const _radius = 14.0;

  static ThemeData light() => _base(
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: SemanticColors.light.accentSolid,
          brightness: Brightness.light,
        ),
        semantic: SemanticColors.light,
        scaffoldBg: const Color(0xFFFAFAFA),
        surface: Colors.white,
      );

  static ThemeData dark() => _base(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: SemanticColors.dark.accentSolid,
          brightness: Brightness.dark,
        ),
        semantic: SemanticColors.dark,
        scaffoldBg: const Color(0xFF18181B),
        surface: const Color(0xFF1F1F23),
      );

  static ThemeData _base({
    required Brightness brightness,
    required ColorScheme colorScheme,
    required SemanticColors semantic,
    required Color scaffoldBg,
    required Color surface,
  }) {
    final scheme = colorScheme.copyWith(
      primary: semantic.accentSolid,
      surface: surface,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: scaffoldBg,
      extensions: [semantic],
      appBarTheme: AppBarTheme(
        backgroundColor: scaffoldBg,
        foregroundColor: scheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: scheme.onSurface,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_radius),
          side: BorderSide(color: semantic.neutralBorder),
        ),
        margin: EdgeInsets.zero,
      ),
      dividerTheme: DividerThemeData(color: semantic.neutralBorder, thickness: 1),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: semantic.neutralBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: semantic.neutralBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: semantic.accentSolid, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: semantic.accentSolid,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: scheme.onSurface,
          side: BorderSide(color: semantic.neutralBorder),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: semantic.accentSolid),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        bodyLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w400),
        bodyMedium: TextStyle(fontSize: 13, fontWeight: FontWeight.w400),
      ),
    );
  }
}

extension SemanticColorsX on BuildContext {
  SemanticColors get semanticColors => Theme.of(this).extension<SemanticColors>()!;
}
