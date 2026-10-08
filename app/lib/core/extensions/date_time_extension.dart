extension DateTimeExtension on DateTime {
  /// Get lunar calendar equivalent (simplified)
  String toLunarDate() {
    // TODO: Implement proper lunar calendar conversion
    return '$year-$month-$day (lunar)';
  }

  /// Format as Korean date string
  String toKoreanString() {
    final months = [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월'
    ];
    final days = [
      '일',
      '월',
      '화',
      '수',
      '목',
      '금',
      '토'
    ];
    return '$year년 ${months[month - 1]} $day일 (${days[weekday % 7]})';
  }

  /// Get age based on birth date
  int getAge() {
    final now = DateTime.now();
    int age = now.year - year;
    if (now.month < month || (now.month == month && now.day < day)) {
      age--;
    }
    return age;
  }
}
