import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

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

  String _isoDate(DateTime d) => d.toIso8601String().split('T').first;

  Future<List<AttendanceMark>> todayMarks() async {
    final today = _isoDate(DateTime.now());
    final response = await _client.dio.get('/attendance/history', queryParameters: {
      'desde': today,
      'hasta': today,
    });
    final list = response.data as List;
    return list.map((e) => AttendanceMark.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<AttendanceMark>> history({DateTime? desde, DateTime? hasta}) async {
    final response = await _client.dio.get('/attendance/history', queryParameters: {
      if (desde != null) 'desde': _isoDate(desde),
      if (hasta != null) 'hasta': _isoDate(hasta),
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
      return _asPending(mark);
    }

    try {
      final response = await _client.dio.post('/attendance', data: mark.toSubmitJson());
      return AttendanceMark.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      // Si el servidor respondió (aunque sea rechazando la marca, ej. tipo de marca inválido),
      // eso es una decisión real, no un problema de red: hay que mostrársela al empleado, no
      // esconderla en la cola offline como si fuera a reintentarse sola.
      if (e.response != null) rethrow;
      // Sin respuesta del servidor (sin conexión, timeout, servidor caído): ahí sí se
      // encola para no perder la marca.
      await _queue.enqueue(mark);
      return _asPending(mark);
    }
  }

  AttendanceMark _asPending(AttendanceMark mark) => AttendanceMark(
        tipoMarca: mark.tipoMarca,
        horaMarcada: mark.horaMarcada,
        latitud: mark.latitud,
        longitud: mark.longitud,
        mockLocation: mark.mockLocation,
        pendienteSync: true,
      );

  Future<void> undo(int markId) async {
    await _client.dio.delete('/attendance/$markId');
  }

  /// Reintenta enviar toda la cola offline en un solo POST /attendance/sync (el backend
  /// espera el arreglo completo de una vez, no una marca por request). Se llama al recuperar
  /// conectividad y al volver la app a primer plano (ver main.dart), nunca en un timer en
  /// segundo plano para no gastar batería.
  Future<int> syncPending() async {
    final pending = await _queue.pending();
    if (pending.isEmpty) return 0;
    if (!await _hasConnectivity) return 0;

    try {
      final response = await _client.dio.post('/attendance/sync', data: {
        'marcas': pending.map((p) => p.mark.toSubmitJson()).toList(),
      });
      final resultados = (response.data as Map<String, dynamic>)['resultados'] as List;

      var synced = 0;
      for (var i = 0; i < pending.length && i < resultados.length; i++) {
        final resultado = resultados[i] as Map<String, dynamic>;
        if (resultado['error'] == null) {
          await _queue.remove(pending[i].localId);
          synced++;
        }
        // si el servidor rechazó una marca puntual (ej. tipo inválido), se deja en la cola
        // para que el empleado la vea reflejada y, si hace falta, pida una corrección.
      }
      return synced;
    } on Object {
      // fallo de red a mitad de camino: se reintenta completo en el próximo ciclo.
      return 0;
    }
  }

  Future<int> get pendingCount => _queue.pendingCount();
}
