import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/attendance_mark.dart';
import '../services/api_client.dart';
import '../services/attendance_service.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../services/offline_queue_service.dart';
import '../theme/app_theme.dart';
import '../widgets/mark_button.dart';
import '../widgets/status_pill.dart';
import 'history_screen.dart';
import 'login_screen.dart';
import 'requests_list_screen.dart';
import 'schedule_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  final _attendanceService = AttendanceService(ApiClient.instance, OfflineQueueService());
  final _locationService = LocationService();
  final _authService = AuthService(ApiClient.instance);

  List<AttendanceMark> _todayMarks = [];
  int _pendingSyncCount = 0;
  bool _loadingToday = true;
  MarkType? _submittingType;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadToday();
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      if (!results.contains(ConnectivityResult.none)) _sync();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _connectivitySub?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _sync();
  }

  Future<void> _sync() async {
    final synced = await _attendanceService.syncPending();
    if (synced > 0) await _loadToday();
  }

  Future<void> _loadToday() async {
    setState(() => _loadingToday = true);
    try {
      final marks = await _attendanceService.todayMarks();
      final pending = await _attendanceService.pendingCount;
      if (!mounted) return;
      setState(() {
        _todayMarks = marks;
        _pendingSyncCount = pending;
      });
    } catch (_) {
      // sin conexión al abrir: se muestra la lista vacía, no es un error bloqueante.
    } finally {
      if (mounted) setState(() => _loadingToday = false);
    }
  }

  AttendanceMark? _lastOf(MarkType type) {
    final matches = _todayMarks.where((m) => m.tipoMarca == type && !m.anulada).toList();
    if (matches.isEmpty) return null;
    matches.sort((a, b) => b.horaMarcada.compareTo(a.horaMarcada));
    return matches.first;
  }

  Future<void> _onMarkTap(MarkType type) async {
    final existing = _lastOf(type);
    if (existing != null) {
      final hora = DateFormat('h:mm a').format(existing.horaMarcada.toLocal());
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('¿registrar de nuevo?'),
          content: Text('ya marcaste tu ${type.label} a las $hora, ¿quieres registrar una nueva marca de todos modos?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('cancelar')),
            ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('sí, registrar')),
          ],
        ),
      );
      if (confirm != true) return;
    }

    setState(() => _submittingType = type);
    try {
      final location = await _locationService.getCurrentLocation();
      final mark = AttendanceMark(
        tipoMarca: type,
        horaMarcada: DateTime.now(),
        latitud: location.latitude,
        longitud: location.longitude,
        mockLocation: location.isMocked,
      );
      final result = await _attendanceService.submit(mark);
      await _loadToday();
      if (!mounted) return;
      _showResultBanner(result);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(e))));
    } finally {
      if (mounted) setState(() => _submittingType = null);
    }
  }

  void _showResultBanner(AttendanceMark mark) {
    final colors = context.semanticColors;
    final (bg, fg, text) = switch (mark.status) {
      MarkStatus.pendienteSync => (
          colors.neutralBg,
          colors.neutralText,
          'sin conexión: tu ${mark.tipoMarca.label} quedó pendiente de sincronizar'
        ),
      MarkStatus.anomalia => (
          colors.warningBg,
          colors.warningText,
          '${mark.tipoMarca.label} registrada con una anomalía, un admin la revisará'
        ),
      _ => (colors.successBg, colors.successText, '${mark.tipoMarca.label} registrada correctamente'),
    };
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      backgroundColor: bg,
      content: Text(text, style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
    ));
  }

  Future<void> _undo(AttendanceMark mark) async {
    if (mark.id == null) return;
    try {
      await _attendanceService.undo(mark.id!);
      await _loadToday();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('marcar asistencia'),
        actions: [
          IconButton(
            tooltip: 'cerrar sesión',
            icon: const Icon(Icons.logout_outlined),
            onPressed: () async {
              await _authService.logout();
              if (!mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadToday,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_pendingSyncCount > 0) _PendingBanner(count: _pendingSyncCount),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                MarkButton(
                  icon: Icons.login_outlined,
                  label: 'entrada',
                  loading: _submittingType == MarkType.entrada,
                  onTap: () => _onMarkTap(MarkType.entrada),
                ),
                MarkButton(
                  icon: Icons.lunch_dining_outlined,
                  label: 'salida a almuerzo',
                  loading: _submittingType == MarkType.salidaAlmuerzo,
                  onTap: () => _onMarkTap(MarkType.salidaAlmuerzo),
                ),
                MarkButton(
                  icon: Icons.restaurant_outlined,
                  label: 'regreso de almuerzo',
                  loading: _submittingType == MarkType.regresoAlmuerzo,
                  onTap: () => _onMarkTap(MarkType.regresoAlmuerzo),
                ),
                MarkButton(
                  icon: Icons.logout_outlined,
                  label: 'salida final',
                  loading: _submittingType == MarkType.salida,
                  onTap: () => _onMarkTap(MarkType.salida),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _QuickLinks(),
            const SizedBox(height: 24),
            Text('marcas de hoy', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            if (_loadingToday)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
            else if (_todayMarks.isEmpty)
              const Padding(padding: EdgeInsets.all(16), child: Text('todavía no tienes marcas hoy'))
            else
              ..._todayMarks.map((mark) => _TodayMarkTile(mark: mark, onUndo: () => _undo(mark))),
          ],
        ),
      ),
    );
  }
}

class _PendingBanner extends StatelessWidget {
  const _PendingBanner({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final colors = context.semanticColors;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.neutralBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.neutralBorder),
      ),
      child: Row(
        children: [
          Icon(Icons.cloud_off_outlined, color: colors.neutralText, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$count marca${count == 1 ? '' : 's'} pendiente${count == 1 ? '' : 's'} de sincronizar, se enviarán solas al recuperar conexión',
              style: TextStyle(color: colors.neutralText, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickLinks extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _QuickLinkCard(
            icon: Icons.calendar_today_outlined,
            label: 'mi horario',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen())),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickLinkCard(
            icon: Icons.history_outlined,
            label: 'mi historial',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickLinkCard(
            icon: Icons.chat_bubble_outline,
            label: 'solicitudes',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RequestsListScreen())),
          ),
        ),
      ],
    );
  }
}

class _QuickLinkCard extends StatelessWidget {
  const _QuickLinkCard({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.semanticColors;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: colors.neutralBorder),
        ),
        child: Column(
          children: [
            Icon(icon, color: colors.accentSolid, size: 22),
            const SizedBox(height: 6),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _TodayMarkTile extends StatelessWidget {
  const _TodayMarkTile({required this.mark, required this.onUndo});

  final AttendanceMark mark;
  final VoidCallback onUndo;

  @override
  Widget build(BuildContext context) {
    final hora = DateFormat('h:mm a').format(mark.horaMarcada.toLocal());
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
                  Text(hora, style: TextStyle(color: context.semanticColors.neutralText, fontSize: 13)),
                  const SizedBox(height: 6),
                  StatusPill.forMark(context, mark.status),
                ],
              ),
            ),
            if (mark.isWithinEditWindow)
              TextButton(onPressed: onUndo, child: const Text('deshacer')),
          ],
        ),
      ),
    );
  }
}
