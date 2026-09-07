import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'location_service.dart';
import 'navigation_service.dart';

/// Base URL configurable en build/run time: flutter run --dart-define=API_BASE_URL=https://...
const _defaultBaseUrl = 'http://localhost:3000/api';
const String apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBaseUrl);

const _tokenKey = 'auth_token';

/// Envoltura delgada sobre Dio: agrega el JWT a cada request y expone
/// login/logout de forma centralizada para que el resto de servicios no
/// conozcan detalles de almacenamiento de sesión.
class ApiClient {
  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: apiBaseUrl,
      // El backend gratuito de Render "duerme" tras inactividad y puede tardar
      // 30-50s en despertar en la primera petición: un timeout corto lo confunde
      // con falta de conexión real y encola la marca innecesariamente.
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
    ));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken();
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onError: (error, handler) async {
        // Un 401 en una request que sí llevaba token es una sesión vencida/inválida (el JWT
        // expira a las pocas horas y el cliente no maneja refresh token): antes se quedaba
        // mostrando un error de "token inválido" sin salida; ahora se cierra la sesión sola y
        // se vuelve al login, sin esperar a que el empleado lo note y reabra la app a mano.
        final teniaToken = error.requestOptions.headers.containsKey('Authorization');
        if (error.response?.statusCode == 401 && teniaToken && !_redirigiendoAlLogin) {
          _redirigiendoAlLogin = true;
          await clearToken();
          pendingLoginMessage = 'Tu sesión expiró, inicia sesión de nuevo.';
          await navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (route) => false);
          _redirigiendoAlLogin = false;
        }
        handler.next(error);
      },
    ));
  }

  bool _redirigiendoAlLogin = false;

  static final ApiClient instance = ApiClient._internal();

  late final Dio _dio;

  Dio get dio => _dio;

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  Future<bool> get hasSession async => (await getToken()) != null;
}

/// Traduce errores de Dio a un mensaje en español apto para mostrar al usuario.
String friendlyErrorMessage(Object error) {
  if (error is LocationException) return error.message;
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['error'] is String) return data['error'] as String;
    // Un 502/503/504 sin cuerpo JSON suele ser el proxy de Render respondiendo mientras
    // el backend (plan gratuito) todavía está despertando, no un error real de la app.
    final statusCode = error.response?.statusCode;
    if (statusCode != null && statusCode >= 500) {
      return 'El servidor está iniciando, intenta de nuevo en unos segundos';
    }
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'La conexión tardó demasiado, intenta de nuevo';
      case DioExceptionType.connectionError:
        return 'No hay conexión con el servidor';
      default:
        return 'Ocurrió un error inesperado, intenta de nuevo';
    }
  }
  return 'Ocurrió un error inesperado, intenta de nuevo';
}
