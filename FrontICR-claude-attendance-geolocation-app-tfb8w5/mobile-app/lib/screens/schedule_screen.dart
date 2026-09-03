import 'package:flutter/material.dart';

import '../models/schedule.dart';
import '../services/api_client.dart';
import '../services/schedule_service.dart';
import '../theme/app_theme.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  final _scheduleService = ScheduleService(ApiClient.instance);
  late Future<Schedule?> _future;

  @override
  void initState() {
    super.initState();
    _future = _scheduleService.mySchedule();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('mi horario')),
      body: FutureBuilder<Schedule?>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text(friendlyErrorMessage(snapshot.error!)));
          }
          final schedule = snapshot.data;
          if (schedule == null) {
            return const Center(child: Text('todavía no tienes un horario asignado'));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _ScheduleRow(icon: Icons.event_outlined, label: 'días', value: schedule.nombresDias.join(', ')),
              _ScheduleRow(icon: Icons.login_outlined, label: 'hora de entrada', value: schedule.horaEntrada),
              _ScheduleRow(icon: Icons.logout_outlined, label: 'hora de salida', value: schedule.horaSalida),
              if (schedule.horaInicioAlmuerzo != null)
                _ScheduleRow(
                  icon: Icons.lunch_dining_outlined,
                  label: 'inicio de almuerzo',
                  value: schedule.horaInicioAlmuerzo!,
                ),
              if (schedule.horaFinAlmuerzo != null)
                _ScheduleRow(
                  icon: Icons.restaurant_outlined,
                  label: 'fin de almuerzo',
                  value: schedule.horaFinAlmuerzo!,
                ),
              _ScheduleRow(
                icon: Icons.timer_outlined,
                label: 'tolerancia',
                value: '${schedule.toleranciaMinutos} minutos',
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  const _ScheduleRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = context.semanticColors;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: colors.accentSolid),
        title: Text(label, style: TextStyle(color: colors.neutralText, fontSize: 13)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }
}
