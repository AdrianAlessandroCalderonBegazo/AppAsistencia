import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:asistencia_empleado/screens/login_screen.dart';
import 'package:asistencia_empleado/theme/app_theme.dart';

void main() {
  testWidgets('la pantalla de login pide dni y contraseña', (tester) async {
    await tester.pumpWidget(MaterialApp(theme: AppTheme.light(), home: const LoginScreen()));

    expect(find.text('Control de asistencia'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'DNI'), findsOneWidget);
    expect(find.text('Ingresar'), findsOneWidget);
  });
}
