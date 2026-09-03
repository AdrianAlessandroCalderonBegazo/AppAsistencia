import 'package:connectivity_plus/connectivity_plus.dart';

import '../models/attendance_mark.dart';
import 'api_client.dart';
import 'offline_queue_service.dart';

class AttendanceService {
  AttendanceService(this._client, this._queue);

  final ApiClient _client;
  final OfflineQueueService _queue;

  Future<bool> get _hasConnectivity async {
    final result = await Connectivity().checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }

  Future<List<AttendanceMark>> todayMarks() async {
    final response = await _client.dio.get('/asistencias', queryParameters: {'rango': 'hoy'});
    final list = response.data as List;
    return list.map((e) => AttendanceMark.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<AttendanceMark>> history({DateTime? desde, DateTime? hasta}) async {
    final response = await _client.dio.get('/asistencias', queryParameters: {
      if (desde != null) 'desde': desde.toIso8601String().split('T').first,
      if (hasta != null) 'hasta': hasta.toIso8601String().split('T').first,
    });
    final list = response.data as List;
    final remote = list.map((e) => AttendanceMark.fromJson(e as Map<String, dynamic>)).toList();
    final pending = (await _queue.pending()).map((p) => p.mark).toList();
    return [...pending, ...remote]..sort((a, b) => b.horaMarcada.compareTo(a.horaMarcada));
  }

  /// Registra una marca. Si no hay conectividad la guarda en la cola local
  /// (sqflite) y la marca queda "pendiente de sincronizar" hasta el próximo
  /// intento exitoso de sync (ver [syncPending]).
  Future<AttendanceMark> submit(AttendanceMark mark) async {
    if (!await _hasConnectivity) {
      await _queue.enqueue(mark);
      return AttendanceMark(
        tipoMarca: mark.tipoMarca,
        horaMarcada: mark.horaMarcada,
        latitud: mark.latitud,
        longitud: mark.longitud,
        mockLocation: mark.mockLocation,
        pendienteSync: true,
      );
    }

    try {
      final response = await _client.dio.post('/asistencias', data: mark.toSubmitJson());
      return AttendanceMark.fromJson(response.data as Map<String, dynamic>);
    } on Object {
      // la petición falló aunque había conectividad reportada (red inestable, servidor caído):
      // igual la encolamos para no perder la marca del empleado.
      await _queue.enqueue(mark);
      return AttendanceMark(
        tipoMarca: mark.tipoMarca,
        horaMarcada: mark.horaMarcada,
        latitud: mark.latitud,
        longitud: mark.longitud,
        mockLocation: mark.mockLocation,
        pendienteSync: true,
      );
    }
  }

  Future<void> undo(int markId) async {
    await _client.dio.delete('/asistencias/$markId');
  }

  /// Reintenta enviar toda la cola offline al endpoint de sync masivo.
  /// Se llama al recuperar conectividad y al volver la app a primer plano
  /// (ver main.dart), nunca en un timer en segundo plano para no gastar batería.
  Future<int> syncPending() async {
    final pending = await _queue.pending();
    if (pending.isEmpty) return 0;
    if (!await _hasConnectivity) return 0;

    var synced = 0;
    for (final item in pending) {
      try {
        await _client.dio.post('/asistencias/sync', data: {
          ...item.mark.toSubmitJson(),
          'origen': 'offline_sync',
        });
        await _queue.remove(item.localId);
        synced++;
      } on Object {
        // se detiene en el primer fallo para reintentar el resto en el próximo ciclo,
        // en el mismo orden en que se registraron.
        break;
      }
    }
    return synced;
  }

  Future<int> get pendingCount => _queue.pendingCount();
}
