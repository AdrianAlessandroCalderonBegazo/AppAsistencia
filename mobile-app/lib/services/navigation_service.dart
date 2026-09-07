import 'package:flutter/material.dart';

/// Permite navegar desde fuera del árbol de widgets (ej. el interceptor de Dio en
/// api_client.dart, que no tiene un BuildContext propio) sin que la capa de servicios
/// tenga que importar pantallas concretas.
final navigatorKey = GlobalKey<NavigatorState>();

/// Mensaje que LoginScreen muestra una vez (y limpia) al volver a esta pantalla — usado para
/// avisar "tu sesión expiró" cuando el redirect lo dispara el interceptor de 401, en vez de
/// dejar al empleado sin saber por qué de repente está de vuelta en el login.
String? pendingLoginMessage;
