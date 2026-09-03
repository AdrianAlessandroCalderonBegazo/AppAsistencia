import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Base URL configurable en build/run time: flutter run --dart-define=API_BASE_URL=https://...
const _defaultBaseUrl = 'http://localhost:3000/api';
const String apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBaseUrl);

const _tokenKey = 'auth_token';

/// Envoltura delgada sobre Dio: agrega el JWT a cada request y expone
/// login/logout de forma centralizada para que el resto de servicios no
/// conozcan detalles de almacenamiento de sesión.
class ApiClient {
  ApiClient._internal() {
    _dio = Dio(BaseOptions(baseUrl: apiBaseUrl, connectTimeout: const Duration(seconds: 15)));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken();
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
    ));
  }

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
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String) return data['message'] as String;
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'la conexión tardó demasiado, intenta de nuevo';
      case DioExceptionType.connectionError:
        return 'no hay conexión con el servidor';
      default:
        return 'ocurrió un error inesperado, intenta de nuevo';
    }
  }
  return 'ocurrió un error inesperado, intenta de nuevo';
}
