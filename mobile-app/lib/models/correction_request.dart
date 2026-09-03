import 'attendance_mark.dart';

enum RequestStatus {
  pendiente,
  aprobada,
  rechazada;

  static RequestStatus fromApiValue(String value) =>
      RequestStatus.values.firstWhere((s) => s.name == value, orElse: () => RequestStatus.pendiente);
}

/// Solicitud de corrección creada por el empleado (database/schema.sql: solicitudes_correccion).
class CorrectionRequest {
  const CorrectionRequest({
    this.id,
    required this.tipoMarca,
    required this.fecha,
    this.horaSolicitada,
    required this.mensajeEmpleado,
    this.estado = RequestStatus.pendiente,
    this.respuestaAdmin,
    this.creadoEn,
  });

  factory CorrectionRequest.fromJson(Map<String, dynamic> json) => CorrectionRequest(
        id: json['id'] as int?,
        tipoMarca: MarkType.fromApiValue(json['tipo_marca'] as String),
        fecha: DateTime.parse(json['fecha'] as String),
        horaSolicitada: json['hora_solicitada'] as String?,
        mensajeEmpleado: json['mensaje_empleado'] as String,
        estado: RequestStatus.fromApiValue(json['estado'] as String? ?? 'pendiente'),
        respuestaAdmin: json['respuesta_admin'] as String?,
        creadoEn: json['creado_en'] != null ? DateTime.parse(json['creado_en'] as String) : null,
      );

  final int? id;
  final MarkType tipoMarca;
  final DateTime fecha;
  final String? horaSolicitada;
  final String mensajeEmpleado;
  final RequestStatus estado;
  final String? respuestaAdmin;
  final DateTime? creadoEn;

  Map<String, dynamic> toJson() => {
        'tipo_marca': tipoMarca.apiValue,
        'fecha': fecha.toIso8601String().split('T').first,
        if (horaSolicitada != null) 'hora_solicitada': horaSolicitada,
        'mensaje_empleado': mensajeEmpleado,
      };
}
