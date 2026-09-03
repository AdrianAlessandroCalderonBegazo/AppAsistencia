import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

/// Pantalla obligatoria en el primer inicio de sesión (contraseña genérica).
/// [forced] quita la posibilidad de retroceder: no hay forma de saltarla.
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key, required this.forced});

  final bool forced;

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _actualController = TextEditingController();
  final _nuevaController = TextEditingController();
  final _confirmarController = TextEditingController();
  final _authService = AuthService(ApiClient.instance);
  bool _loading = false;

  @override
  void dispose() {
    _actualController.dispose();
    _nuevaController.dispose();
    _confirmarController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await _authService.changePassword(
        passwordActual: _actualController.text,
        passwordNueva: _nuevaController.text,
      );
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyErrorMessage(e))));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !widget.forced,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('cambiar contraseña'),
          automaticallyImplyLeading: !widget.forced,
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (widget.forced) ...[
                    Text(
                      'por seguridad debes crear una contraseña nueva antes de continuar',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 20),
                  ],
                  TextFormField(
                    controller: _actualController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'contraseña actual'),
                    validator: (v) => (v == null || v.isEmpty) ? 'obligatorio' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _nuevaController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'nueva contraseña'),
                    validator: (v) =>
                        (v == null || v.length < 6) ? 'mínimo 6 caracteres' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _confirmarController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'confirmar nueva contraseña'),
                    validator: (v) =>
                        v != _nuevaController.text ? 'las contraseñas no coinciden' : null,
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
                        : const Text('guardar y continuar'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
