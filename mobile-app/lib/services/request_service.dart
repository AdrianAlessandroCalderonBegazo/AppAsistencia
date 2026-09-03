import '../models/correction_request.dart';
import 'api_client.dart';

class RequestService {
  RequestService(this._client);

  final ApiClient _client;

  Future<List<CorrectionRequest>> mine() async {
    final response = await _client.dio.get('/solicitudes');
    final list = response.data as List;
    return list.map((e) => CorrectionRequest.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CorrectionRequest> create(CorrectionRequest request) async {
    final response = await _client.dio.post('/solicitudes', data: request.toJson());
    return CorrectionRequest.fromJson(response.data as Map<String, dynamic>);
  }
}
