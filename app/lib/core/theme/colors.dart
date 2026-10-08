import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF6B5B95);  // Purple
  static const Color secondary = Color(0xFFF39C12); // Orange
  static const Color accent = Color(0xFF3498DB);   // Blue

  // Status Colors
  static const Color success = Color(0xFF27AE60);
  static const Color error = Color(0xFFE74C3C);
  static const Color warning = Color(0xFFF39C12);
  static const Color info = Color(0xFF3498DB);

  // Light Mode Colors
  static const Color lightBackground = Color(0xFFFAFAFA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color darkText = Color(0xFF1A1A1A);
  static const Color lightBorder = Color(0xFFE0E0E0);
  static const Color lightDivider = Color(0xFFF0F0F0);

  // Dark Mode Colors
  static const Color darkBackground = Color(0xFF0A0A0A);
  static const Color darkSurface = Color(0xFF1F1F1F);
  static const Color lightText = Color(0xFFFAFAFA);
  static const Color darkBorder = Color(0xFF333333);
  static const Color darkDivider = Color(0xFF2A2A2A);

  // Semantic Colors
  static const Color disabled = Color(0xFFBDBDBD);
  static const Color placeholder = Color(0xFF9E9E9E);

  // Five Elements Colors (오행)
  static const Color wood = Color(0xFF27AE60);   // Green (목)
  static const Color fire = Color(0xFFE74C3C);   // Red (화)
  static const Color earth = Color(0xFFF39C12);  // Orange (토)
  static const Color metal = Color(0xFFECF0F1);  // White (금)
  static const Color water = Color(0xFF3498DB);  // Blue (수)

  // Gradient Colors for Fortune Cards
  static const List<Color> fortuneGradient = [
    Color(0xFF6B5B95),
    Color(0xFF3498DB),
  ];

  static const List<Color> luckGradient = [
    Color(0xFFF39C12),
    Color(0xFFE74C3C),
  ];
}
