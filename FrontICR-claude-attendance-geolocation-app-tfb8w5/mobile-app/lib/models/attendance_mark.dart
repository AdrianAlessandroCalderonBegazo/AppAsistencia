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
        MarkType.entrada => 'entrada',
        MarkType.salidaAlmuerzo => 'salida a almuerzo',
        MarkType.regresoAlmuerzo => 'regreso de almuerzo',
        MarkType.salida => 'salida final',
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

  Map<String, dynamic> toSubmitJson() => {
        'tipo_marca': tipoMarca.apiValue,
        'hora_marcada': horaMarcada.toUtc().toIso8601String(),
        'latitud': latitud,
        'longitud': longitud,
        'mock_location': mockLocation,
      };
}
