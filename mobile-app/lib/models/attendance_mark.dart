/// Tipos de marca soportados por el backend (ver database/schema.sql: asistencias.tipo_marca).
enum MarkType {
  entrada,
  salidaAlmuerzo,
  regresoAlmuerzo,
  salida;

  String get apiValue => switch (this) {
        MarkType.entrada => 'entrada',
        MarkType.salidaAlmuerzo => 'salida_almuerzo',
        MarkType.regresoAlmuerzo => 'regreso_almuerzo',
        MarkType.salida => 'salida',
      };

  String get label => switch (this) {
        MarkType.entrada => 'Entrada',
        MarkType.salidaAlmuerzo => 'Salida a almuerzo',
        MarkType.regresoAlmuerzo => 'Regreso de almuerzo',
        MarkType.salida => 'Salida final',
      };

  static MarkType fromApiValue(String value) => MarkType.values.firstWhere(
        (t) => t.apiValue == value,
        orElse: () => MarkType.entrada,
      );
}

/// Estado visual de una marca en el historial, resuelto a partir de los
/// campos del backend (o, si aún no se envió, del estado local de la cola offline).
enum MarkStatus { dentroDeArea, anomalia, pendienteSync, creadaPorSolicitud }

class AttendanceMark {
  const AttendanceMark({
    this.id,
    required this.tipoMarca,
    required this.horaMarcada,
    required this.latitud,
    required this.longitud,
    this.distanciaMetros,
    this.dentroArea = true,
    this.origen = 'normal',
    this.esAnomalia = false,
    this.motivoAnomalia,
    this.editableHasta,
    this.anulada = false,
    this.mockLocation = false,
    this.pendienteSync = false,
    this.localId,
  });

  factory AttendanceMark.fromJson(Map<String, dynamic> json) => AttendanceMark(
        id: json['id'] as int?,
        tipoMarca: MarkType.fromApiValue(json['tipo_marca'] as String),
        horaMarcada: DateTime.parse(json['hora_marcada'] as String),
        latitud: (json['latitud'] as num).toDouble(),
        longitud: (json['longitud'] as num).toDouble(),
        distanciaMetros: (json['distancia_metros'] as num?)?.toDouble(),
        dentroArea: json['dentro_area'] as bool? ?? true,
        origen: json['origen'] as String? ?? 'normal',
        esAnomalia: json['es_anomalia'] as bool? ?? false,
        motivoAnomalia: json['motivo_anomalia'] as String?,
        editableHasta: json['editable_hasta'] != null
            ? DateTime.parse(json['editable_hasta'] as String)
            : null,
        anulada: json['anulada'] as bool? ?? false,
      );

  /// Id asignado por el servidor. Nulo mientras la marca vive solo en la cola offline.
  final int? id;

  /// Id local (fila de sqlite) usado para identificar marcas pendientes antes de sincronizar.
  final int? localId;

  final MarkType tipoMarca;
  final DateTime horaMarcada;
  final double latitud;
  final double longitud;
  final double? distanciaMetros;
  final bool dentroArea;
  final String origen;
  final bool esAnomalia;
  final String? motivoAnomalia;
  final DateTime? editableHasta;
  final bool anulada;
  final bool mockLocation;
  final bool pendienteSync;

  MarkStatus get status {
    if (pendienteSync) return MarkStatus.pendienteSync;
    if (origen == 'solicitud_aprobada') return MarkStatus.creadaPorSolicitud;
    if (esAnomalia || !dentroArea) return MarkStatus.anomalia;
    return MarkStatus.dentroDeArea;
  }

  bool get isWithinEditWindow =>
      !pendienteSync && editableHasta != null && DateTime.now().isBefore(editableHasta!);

  /// Mensaje específico para mostrarle al empleado por qué su marca quedó como anomalía,
  /// interpretando el motivo que arma el backend (ver detectAnomaly/insertMark en
  /// backend/src/routes/attendance.js) en vez de un genérico "anomalía" poco claro.
  String get anomalyDescription {
    final motivo = motivoAnomalia ?? '';
    if (motivo.contains('fuera del área')) {
      return 'Se registró, pero fuera del lugar de trabajo';
    }
    if (motivo.contains('duplicada')) {
      return 'Se registró, pero ya tenías una marca de este tipo hoy';
    }
    if (motivo.contains('fuera del orden')) {
      return 'Se registró, pero fuera del orden esperado del día';
    }
    return 'Se registró con una observación, un admin la revisará';
  }

  Map<String, dynamic> toSubmitJson() => {
        'tipoMarca': tipoMarca.apiValue,
        'horaMarcada': horaMarcada.toUtc().toIso8601String(),
        // Se manda la fecha calendario local explícita (no se deja que el backend la derive
        // de horaMarcada en UTC): si el empleado marca de noche en una zona horaria detrás de
        // UTC, la fecha en UTC ya sería "mañana" y la marca desaparecería de "hoy"/"historial"
        // al filtrar por la fecha local del dispositivo.
        'fecha': _localDateString(horaMarcada),
        'lat': latitud,
        'lng': longitud,
        // el backend todavía no persiste ni usa esta señal; se envía igual para
        // no perderla el día que se agregue como capa extra de defensa server-side.
        'mockLocation': mockLocation,
      };
}

String _localDateString(DateTime dt) {
  final local = dt.isUtc ? dt.toLocal() : dt;
  final y = local.year.toString().padLeft(4, '0');
  final m = local.month.toString().padLeft(2, '0');
  final d = local.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}
