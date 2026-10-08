class AppConstants {
  // API Endpoints
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authLogout = '/auth/logout';

  static const String fortuneAnalyze = '/fortune/analyze';
  static const String fortuneDaily = '/fortune/daily';
  static const String fortuneMonthly = '/fortune/monthly';
  static const String fortuneYearly = '/fortune/yearly';
  static const String fortuneHistory = '/fortune/history';

  static const String userProfile = '/user/profile';
  static const String userUpdate = '/user/profile';

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const String emailRegex =
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';

  // Duration
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration tokenRefreshBuffer = Duration(minutes: 5);

  // Pagination
  static const int defaultPageSize = 20;
  static const int defaultPage = 1;

  // Five Elements (오행)
  static const List<String> fiveElements = ['목', '화', '토', '금', '수'];
  // Heavenly Stems (천간)
  static const List<String> heavenlyStems = [
    '갑',
    '을',
    '병',
    '정',
    '무',
    '기',
    '경',
    '신',
    '임',
    '계'
  ];
  // Earthly Branches (지지)
  static const List<String> earthlyBranches = [
    '자',
    '축',
    '인',
    '묘',
    '진',
    '사',
    '오',
    '미',
    '신',
    '유',
    '술',
    '해'
  ];
}
