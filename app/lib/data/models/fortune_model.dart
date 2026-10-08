import 'package:json_annotation/json_annotation.dart';

part 'fortune_model.g.dart';

@JsonSerializable()
class FortuneModel {
  final int id;
  @JsonKey(name: 'birth_date')
  final String birthDate;
  @JsonKey(name: 'birth_time')
  final String? birthTime;
  final String gender;
  @JsonKey(name: 'heavenly_stem')
  final String heavenlyStem;
  @JsonKey(name: 'earthly_branch')
  final String earthlyBranch;
  @JsonKey(name: 'five_elements')
  final Map<String, int> fiveElements;
  final String personality;
  final String? luckyColor;
  final int? luckyNumber;
  final DateTime createdAt;

  FortuneModel({
    required this.id,
    required this.birthDate,
    this.birthTime,
    required this.gender,
    required this.heavenlyStem,
    required this.earthlyBranch,
    required this.fiveElements,
    required this.personality,
    this.luckyColor,
    this.luckyNumber,
    required this.createdAt,
  });

  factory FortuneModel.fromJson(Map<String, dynamic> json) =>
      _$FortuneModelFromJson(json);

  Map<String, dynamic> toJson() => _$FortuneModelToJson(this);
}

@JsonSerializable()
class DailyFortuneModel {
  final String date;
  @JsonKey(name: 'overall_luck')
  final int overallLuck;
  final int health;
  final int love;
  final int wealth;
  final int work;
  @JsonKey(name: 'fortune_text')
  final String fortuneText;
  @JsonKey(name: 'lucky_color')
  final String luckyColor;
  @JsonKey(name: 'lucky_number')
  final int luckyNumber;

  DailyFortuneModel({
    required this.date,
    required this.overallLuck,
    required this.health,
    required this.love,
    required this.wealth,
    required this.work,
    required this.fortuneText,
    required this.luckyColor,
    required this.luckyNumber,
  });

  factory DailyFortuneModel.fromJson(Map<String, dynamic> json) =>
      _$DailyFortuneModelFromJson(json);

  Map<String, dynamic> toJson() => _$DailyFortuneModelToJson(this);
}
