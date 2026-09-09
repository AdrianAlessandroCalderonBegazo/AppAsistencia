/// Horario asignado a un empleado (database/schema.sql: tabla horarios).
class Schedule {
  const Schedule({
    required this.diasSemana,
    required this.horaEntrada,
    required this.horaSalida,
    this.duracionAlmuerzoMinutos,
    required this.toleranciaMinutos,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) => Schedule(
        diasSemana: (json['dias_semana'] as List).map((d) => d as int).toList(),
        horaEntrada: json['hora_entrada'] as String,
        horaSalida: json['hora_salida'] as String,
        duracionAlmuerzoMinutos: json['duracion_almuerzo_minutos'] as int?,
        toleranciaMinutos: json['tolerancia_minutos'] as int? ?? 0,
      );

  /// 0 = domingo .. 6 = sábado, igual que en la base de datos.
  final List<int> diasSemana;
  final String horaEntrada;
  final String horaSalida;
  // El almuerzo no tiene horario fijo: se puede tomar en cualquier momento de la jornada,
  // por eso solo se guarda cuánto dura, no una ventana de hora inicio/fin.
  final int? duracionAlmuerzoMinutos;
  final int toleranciaMinutos;

  static const _nombresDias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  List<String> get nombresDias =>
      (diasSemana.toList()..sort()).map((d) => _nombresDias[d % 7]).toList();
}
