import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/attendance_mark.dart';
import '../models/correction_request.dart';
import '../services/api_client.dart';
import '../services/request_service.dart';

class NewRequestScreen extends StatefulWidget {
  const NewRequestScreen({super.key});

  @override
  State<NewRequestScreen> createState() => _NewRequestScreenState();
}

class _NewRequestScreenState extends State<NewRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _requestService = RequestService(ApiClient.instance);
  final _messageController = TextEditingController();

  MarkType _tipo = MarkType.entrada;
  DateTime _fecha = DateTime.now();
  bool _loading = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 60)),
      lastDate: DateTime.now(),
      initialDate: _fecha,
    );
    if (picked != null) setState(() => _fecha = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await _requestService.create(CorrectionRequest(
        tipoMarca: _tipo,
        fecha: _fecha,
        mensajeEmpleado: _messageController.text.trim(),
      ));
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(e))));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('nueva solicitud')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'cuéntanos qué marca necesitas corregir y un admin la revisará',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<MarkType>(
                  value: _tipo,
                  decoration: const InputDecoration(labelText: 'tipo de marca'),
                  items: MarkType.values
                      .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
                      .toList(),
                  onChanged: (v) => setState(() => _tipo = v ?? _tipo),
                ),
                const SizedBox(height: 14),
                InkWell(
                  onTap: _pickDate,
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'fecha'),
                    child: Text(DateFormat('d MMM yyyy').format(_fecha)),
                  ),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _messageController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'mensaje',
                    alignLabelWithHint: true,
                    hintText: 'explica brevemente qué pasó',
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'cuéntanos qué pasó' : null,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('enviar solicitud'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
