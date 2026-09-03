/// Horario asignado a un empleado (database/schema.sql: tabla horarios).
class Schedule {
  const Schedule({
    required this.diasSemana,
    required this.horaEntrada,
    required this.horaSalida,
    this.horaInicioAlmuerzo,
    this.horaFinAlmuerzo,
    required this.toleranciaMinutos,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) => Schedule(
        diasSemana: (json['dias_semana'] as List).map((d) => d as int).toList(),
        horaEntrada: json['hora_entrada'] as String,
        horaSalida: json['hora_salida'] as String,
        horaInicioAlmuerzo: json['hora_inicio_almuerzo'] as String?,
        horaFinAlmuerzo: json['hora_fin_almuerzo'] as String?,
        toleranciaMinutos: json['tolerancia_minutos'] as int? ?? 0,
      );

  /// 0 = domingo .. 6 = sábado, igual que en la base de datos.
  final List<int> diasSemana;
  final String horaEntrada;
  final String horaSalida;
  final String? horaInicioAlmuerzo;
  final String? horaFinAlmuerzo;
  final int toleranciaMinutos;

  static const _nombresDias = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ];

  List<String> get nombresDias =>
      (diasSemana.toList()..sort()).map((d) => _nombresDias[d % 7]).toList();
}
