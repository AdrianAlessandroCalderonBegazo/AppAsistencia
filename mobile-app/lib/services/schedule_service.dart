import '../models/schedule.dart';
import 'api_client.dart';

class ScheduleService {
  ScheduleService(this._client);

  final ApiClient _client;

  Future<Schedule?> mySchedule() async {
    final response = await _client.dio.get('/horarios/mio');
    if (response.data == null) return null;
    return Schedule.fromJson(response.data as Map<String, dynamic>);
  }
}
