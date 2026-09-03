class User {
  const User({
    required this.id,
    required this.dni,
    required this.nombre,
    required this.debeCambiarPassword,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        dni: json['dni'] as String,
        nombre: json['nombre'] as String,
        debeCambiarPassword: json['debe_cambiar_password'] as bool? ?? false,
      );

  final int id;
  final String dni;
  final String nombre;
  final bool debeCambiarPassword;

  User copyWith({bool? debeCambiarPassword}) => User(
        id: id,
        dni: dni,
        nombre: nombre,
        debeCambiarPassword: debeCambiarPassword ?? this.debeCambiarPassword,
      );
}
