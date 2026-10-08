class AppConfig {
  // API Configuration
  static const String apiBaseUrl = 'http://localhost:8000';
  static const String apiVersion = 'v1';
  static const String apiTimeout = '30';

  // App Configuration
  static const String appName = 'Miki';
  static const String appVersion = '1.0.0';
  static const bool debugMode = true;

  // Feature Flags
  static const bool enableAnalytics = false;
  static const bool enableCrashReporting = false;
}
