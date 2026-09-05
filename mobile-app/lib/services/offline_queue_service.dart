import 'dart:convert';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import '../models/attendance_mark.dart';

/// Marca guardada localmente porque no había conexión al momento de registrarla.
class PendingMark {
  const PendingMark({required this.localId, required this.mark});

  final int localId;
  final AttendanceMark mark;
}

const _table = 'pending_marks';
const _webPrefsKey = 'pending_marks_web';

/// Cola local para marcas capturadas sin conectividad. En Android/iOS/desktop usa sqflite;
/// ese paquete no tiene implementación para Flutter Web (cada llamada lanza
/// MissingPluginException ahí), así que en web se usa SharedPreferences (localStorage del
/// navegador) guardando la lista como JSON. Sin esto, cualquier pantalla que consultara la
/// cola —aunque fuera solo para contar pendientes— fallaba en cada carga en la versión web y
/// dejaba "hoy"/"historial" sin poder actualizarse, incluso cuando el backend sí tenía la marca.
class OfflineQueueService {
  Database? _db;

  Future<Database> get _database async {
    if (_db != null) return _db!;
    final dbPath = await getDatabasesPath();
    _db = await openDatabase(
      p.join(dbPath, 'asistencia_offline.db'),
      version: 1,
      onCreate: (db, version) => db.execute('''
        CREATE TABLE $_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo_marca TEXT NOT NULL,
          hora_marcada TEXT NOT NULL,
          latitud REAL NOT NULL,
          longitud REAL NOT NULL,
          mock_location INTEGER NOT NULL DEFAULT 0
        )
      '''),
    );
    return _db!;
  }

  Future<PendingMark> enqueue(AttendanceMark mark) async {
    if (kIsWeb) return _enqueueWeb(mark);
    final db = await _database;
    final localId = await db.insert(_table, {
      'tipo_marca': mark.tipoMarca.apiValue,
      'hora_marcada': mark.horaMarcada.toUtc().toIso8601String(),
      'latitud': mark.latitud,
      'longitud': mark.longitud,
      'mock_location': mark.mockLocation ? 1 : 0,
    });
    return PendingMark(localId: localId, mark: mark);
  }

  Future<List<PendingMark>> pending() async {
    if (kIsWeb) return _pendingWeb();
    final db = await _database;
    final rows = await db.query(_table, orderBy: 'hora_marcada ASC');
    return rows
        .map((row) => PendingMark(
              localId: row['id'] as int,
              mark: AttendanceMark(
                localId: row['id'] as int,
                tipoMarca: MarkType.fromApiValue(row['tipo_marca'] as String),
                horaMarcada: DateTime.parse(row['hora_marcada'] as String),
                latitud: row['latitud'] as double,
                longitud: row['longitud'] as double,
                mockLocation: (row['mock_location'] as int) == 1,
                pendienteSync: true,
              ),
            ))
        .toList();
  }

  Future<void> remove(int localId) async {
    if (kIsWeb) return _removeWeb(localId);
    final db = await _database;
    await db.delete(_table, where: 'id = ?', whereArgs: [localId]);
  }

  Future<int> pendingCount() async {
    if (kIsWeb) return (await _pendingWeb()).length;
    final db = await _database;
    final result = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM $_table'));
    return result ?? 0;
  }

  // --- Implementación web: SharedPreferences (localStorage) con una lista JSON ---

  Future<List<Map<String, dynamic>>> _readWebRows() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_webPrefsKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
  }

  Future<void> _writeWebRows(List<Map<String, dynamic>> rows) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_webPrefsKey, jsonEncode(rows));
  }

  Future<PendingMark> _enqueueWeb(AttendanceMark mark) async {
    final rows = await _readWebRows();
    final localId =
        rows.isEmpty ? 1 : (rows.map((r) => r['id'] as int).reduce((a, b) => a > b ? a : b) + 1);
    rows.add({
      'id': localId,
      'tipo_marca': mark.tipoMarca.apiValue,
      'hora_marcada': mark.horaMarcada.toUtc().toIso8601String(),
      'latitud': mark.latitud,
      'longitud': mark.longitud,
      'mock_location': mark.mockLocation ? 1 : 0,
    });
    await _writeWebRows(rows);
    return PendingMark(localId: localId, mark: mark);
  }

  Future<List<PendingMark>> _pendingWeb() async {
    final rows = await _readWebRows();
    rows.sort((a, b) => (a['hora_marcada'] as String).compareTo(b['hora_marcada'] as String));
    return rows
        .map((row) => PendingMark(
              localId: row['id'] as int,
              mark: AttendanceMark(
                localId: row['id'] as int,
                tipoMarca: MarkType.fromApiValue(row['tipo_marca'] as String),
                horaMarcada: DateTime.parse(row['hora_marcada'] as String),
                latitud: (row['latitud'] as num).toDouble(),
                longitud: (row['longitud'] as num).toDouble(),
                mockLocation: (row['mock_location'] as int) == 1,
                pendienteSync: true,
              ),
            ))
        .toList();
  }

  Future<void> _removeWeb(int localId) async {
    final rows = await _readWebRows();
    rows.removeWhere((r) => r['id'] == localId);
    await _writeWebRows(rows);
  }
}
