import 'package:firebase_messaging/firebase_messaging.dart';

import 'auth_service.dart';

/// Notificaciones push (recordatorios de horario, solicitudes resueltas,
/// correcciones de un admin). Requiere que Firebase esté inicializado en
/// main.dart y los archivos de configuración nativos ya colocados (ver README).
class NotificationService {
  NotificationService(this._authService);

  final AuthService _authService;

  Future<void> initAndRegister() async {
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(alert: true, badge: true, sound: true);

    final token = await messaging.getToken();
    if (token != null) {
      await _authService.registerFcmToken(token);
    }
    messaging.onTokenRefresh.listen(_authService.registerFcmToken);
  }
}
