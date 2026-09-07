import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/correction_request.dart';
import '../services/api_client.dart';
import '../services/request_service.dart';
import '../theme/app_theme.dart';
import '../widgets/status_pill.dart';
import 'new_request_screen.dart';

class RequestsListScreen extends StatefulWidget {
  const RequestsListScreen({super.key});

  @override
  State<RequestsListScreen> createState() => _RequestsListScreenState();
}

class _RequestsListScreenState extends State<RequestsListScreen> {
  final _requestService = RequestService(ApiClient.instance);
  late Future<List<CorrectionRequest>> _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() => _future = _requestService.mine();

  Future<void> _openNewRequest() async {
    final created = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const NewRequestScreen()),
    );
    if (created == true) setState(_load);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Solicitudes')),
      // El botón vive dentro del scroll (al final de la lista, o centrado si no hay
      // solicitudes) en vez de ser un FloatingActionButton: como flotante, al agregar la
      // app a la pantalla de inicio en iOS quedaba tapado por el área segura del sistema
      // (barra inferior) y el empleado no podía tocarlo.
      body: RefreshIndicator(
        onRefresh: () async => setState(_load),
        child: FutureBuilder<List<CorrectionRequest>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: Text(friendlyErrorMessage(snapshot.error!)));
            }
            final requests = snapshot.data ?? [];
            if (requests.isEmpty) {
              return LayoutBuilder(
                builder: (context, constraints) => ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(24),
                  children: [
                    ConstrainedBox(
                      constraints: BoxConstraints(minHeight: constraints.maxHeight),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('Todavía no has enviado solicitudes'),
                            const SizedBox(height: 20),
                            _NewRequestButton(onPressed: _openNewRequest),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              itemCount: requests.length + 1,
              itemBuilder: (context, index) {
                if (index == requests.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Center(child: _NewRequestButton(onPressed: _openNewRequest)),
                  );
                }
                return _RequestTile(request: requests[index]);
              },
            );
          },
        ),
      ),
    );
  }
}

class _NewRequestButton extends StatelessWidget {
  const _NewRequestButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: const Icon(Icons.add),
      label: const Text('Nueva solicitud'),
    );
  }
}

class _RequestTile extends StatelessWidget {
  const _RequestTile({required this.request});

  final CorrectionRequest request;

  @override
  Widget build(BuildContext context) {
    final colors = context.semanticColors;
    final fecha = DateFormat('d MMM yyyy').format(request.fecha);
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('${request.tipoMarca.label} · $fecha',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                StatusPill.forRequest(context, request.estado),
              ],
            ),
            const SizedBox(height: 8),
            Text(request.mensajeEmpleado, style: TextStyle(color: colors.neutralText)),
            if (request.respuestaAdmin != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: colors.accentBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Respuesta del admin: ${request.respuestaAdmin}',
                  style: TextStyle(color: colors.accentText, fontSize: 13),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
