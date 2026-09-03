import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../models/attendance_mark.dart';

/// Marca guardada localmente porque no había conexión al momento de registrarla.
class PendingMark {
  const PendingMark({required this.localId, required this.mark});

  final int localId;
  final AttendanceMark mark;
}

const _table = 'pending_marks';

/// Cola local (sqflite) para marcas capturadas sin conectividad. Cada fila
/// guarda el payload ya listo para reenviar tal cual el backend lo espera,
/// más los metadatos que la UI necesita para mostrar "pendiente de sincronizar".
class OfflineQueueService {
  Database? _db;

  Future<Database> get _database async {
    if (_db != null) return _db!;
    final dbPath = await getDatabasesPath();
    _db = await openDatabase(
      p.join(dbPath, 'fronticr_offline.db'),
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
    final db = await _database;
    await db.delete(_table, where: 'id = ?', whereArgs: [localId]);
  }

  Future<int> pendingCount() async {
    final db = await _database;
    final result = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM $_table'));
    return result ?? 0;
  }
}
