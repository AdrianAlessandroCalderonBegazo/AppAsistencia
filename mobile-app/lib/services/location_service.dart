import 'package:geolocator/geolocator.dart';

class CapturedLocation {
  const CapturedLocation({required this.latitude, required this.longitude, required this.isMocked});

  final double latitude;
  final double longitude;
  final bool isMocked;
}

class LocationException implements Exception {
  LocationException(this.message);
  final String message;
}

/// Obtiene la posición actual, pidiendo permisos si hace falta. El backend es
/// quien decide si la marca cae dentro del área permitida (ver backend/src/utils/geo.js);
/// aquí solo capturamos y reenviamos la señal de ubicación simulada (mock) para
/// que el servidor la tenga en cuenta como una capa más de defensa, sin bloquear al empleado.
class LocationService {
  Future<CapturedLocation> getCurrentLocation() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw LocationException('activa la ubicación del dispositivo para poder marcar');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      throw LocationException('se necesita permiso de ubicación para poder marcar');
    }

    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    );

    return CapturedLocation(
      latitude: position.latitude,
      longitude: position.longitude,
      isMocked: position.isMocked,
    );
  }
}
