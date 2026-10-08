import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final int id;
  final String email;
  final String name;
  final DateTime createdAt;
  @JsonKey(name: 'fortunes_count')
  final int fortunesCount;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.createdAt,
    this.fortunesCount = 0,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
