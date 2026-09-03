import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es');

  // Firebase es opcional en desarrollo: si no hay archivos de configuración
  // nativos (google-services.json / GoogleService-Info.plist, ver README) la
  // inicialización falla y seguimos sin push en vez de tumbar la app.
  try {
    await Firebase.initializeApp();
  } catch (_) {
    // no-op: push quedará deshabilitado hasta que se configure Firebase.
  }

  runApp(const FrontIcrApp());
}

class FrontIcrApp extends StatelessWidget {
  const FrontIcrApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'control de asistencia',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      home: const _StartupGate(),
    );
  }
}

/// Decide la primera pantalla según si ya hay una sesión guardada.
class _StartupGate extends StatefulWidget {
  const _StartupGate();

  @override
  State<_StartupGate> createState() => _StartupGateState();
}

class _StartupGateState extends State<_StartupGate> {
  final _authService = AuthService(ApiClient.instance);
  bool? _hasSession;

  @override
  void initState() {
    super.initState();
    _authService.hasSession.then((value) async {
      if (value) {
        try {
          await NotificationService(_authService).initAndRegister();
        } catch (_) {
          // push no disponible (Firebase sin configurar): no bloquea el arranque.
        }
      }
      if (mounted) setState(() => _hasSession = value);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasSession == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    // Nota: si el JWT sigue vigente pero el usuario nunca completó el cambio
    // de contraseña obligatorio, el backend debe rechazar otras rutas hasta
    // que lo haga; el home screen mostrará el error correspondiente si pasa.
    return _hasSession! ? const HomeScreen() : const LoginScreen();
  }
}
