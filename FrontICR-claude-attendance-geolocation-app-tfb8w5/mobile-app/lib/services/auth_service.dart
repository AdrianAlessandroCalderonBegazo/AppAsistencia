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
    await _client.saveToken(data['token'] as String);
    return User.fromJson(data['usuario'] as Map<String, dynamic>);
  }

  Future<void> changePassword({
    required String passwordActual,
    required String passwordNueva,
  }) async {
    await _client.dio.post('/auth/cambiar-password', data: {
      'password_actual': passwordActual,
      'password_nueva': passwordNueva,
    });
  }

  Future<void> logout() => _client.clearToken();

  Future<bool> get hasSession => _client.hasSession;

  Future<void> registerFcmToken(String token) async {
    await _client.dio.post('/auth/fcm-token', data: {'fcm_token': token});
  }
}
