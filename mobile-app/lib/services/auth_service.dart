import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  AuthService(this._client);

  final ApiClient _client;

  Future<User> login({required String dni, required String password}) async {
    final response = await _client.dio.post('/auth/login', data: {
      'dni': dni,
      'password': password,
    });
    final data = response.data as Map<String, dynamic>;
    await _client.saveToken(data['accessToken'] as String);
    final usuario = data['usuario'] as Map<String, dynamic>;
    // debeCambiarPassword viaja en la raíz de la respuesta de login, no dentro de "usuario".
    return User.fromJson({...usuario, 'debe_cambiar_password': data['debeCambiarPassword']});
  }

  Future<void> changePassword({
    required String passwordActual,
    required String passwordNueva,
  }) async {
    final response = await _client.dio.post('/auth/change-password', data: {
      'currentPassword': passwordActual,
      'newPassword': passwordNueva,
    });
    final data = response.data as Map<String, dynamic>;
    // El accessToken viejo todavía trae debe_cambiar_password=true codificado adentro; sin
    // reemplazarlo el backend seguiría bloqueando todo con PASSWORD_CHANGE_REQUIRED.
    await _client.saveToken(data['accessToken'] as String);
  }

  Future<void> logout() => _client.clearToken();

  Future<bool> get hasSession => _client.hasSession;

  Future<void> registerFcmToken(String token) async {
    await _client.dio.put('/employees/me/fcm-token', data: {'fcmToken': token});
  }
}
