import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/attendance_mark.dart';
import '../services/api_client.dart';
import '../services/attendance_service.dart';
import '../services/offline_queue_service.dart';
import '../theme/app_theme.dart';
import '../widgets/status_pill.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _attendanceService = AttendanceService(ApiClient.instance, OfflineQueueService());

  DateTimeRange _range = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 6)),
    end: DateTime.now(),
  );
  Future<List<AttendanceMark>>? _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    setState(() => _future = _attendanceService.history(desde: _range.start, hasta: _range.end));
  }

  Future<void> _pickRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      initialDateRange: _range,
    );
    if (picked != null) {
      setState(() => _range = picked);
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatoRango = DateFormat('d MMM', 'es');
    return Scaffold(
      appBar: AppBar(
        title: const Text('mi historial'),
        actions: [
          IconButton(icon: const Icon(Icons.date_range_outlined), onPressed: _pickRange),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Icon(Icons.calendar_today_outlined, size: 16, color: context.semanticColors.neutralText),
                const SizedBox(width: 8),
                Text(
                  '${formatoRango.format(_range.start)} — ${formatoRango.format(_range.end)}',
                  style: TextStyle(color: context.semanticColors.neutralText, fontSize: 13),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<AttendanceMark>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(friendlyErrorMessage(snapshot.error!)));
                }
                final marks = snapshot.data ?? [];
                if (marks.isEmpty) {
                  return const Center(child: Text('no hay marcas en este rango de fechas'));
                }
                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  itemCount: marks.length,
                  itemBuilder: (context, index) => _HistoryTile(mark: marks[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.mark});

  final AttendanceMark mark;

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('EEEE d MMM, h:mm a', 'es').format(mark.horaMarcada.toLocal());
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(mark.tipoMarca.label, style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(fecha, style: TextStyle(color: context.semanticColors.neutralText, fontSize: 13)),
                ],
              ),
            ),
            StatusPill.forMark(context, mark.status),
          ],
        ),
      ),
    );
  }
}
