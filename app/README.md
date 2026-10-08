# 🔮 Miki Flutter App

Oriental Fortune & Destiny Reader - Flutter Frontend

## 📱 프로젝트 구조

```
lib/
├── main.dart                    # 앱 진입점
├── core/
│   ├── theme/                   # 테마 설정 (Dark/Light Mode)
│   │   ├── app_theme.dart
│   │   └── colors.dart
│   ├── config/                  # 앱 설정
│   │   └── app_config.dart
│   ├── constants/               # 상수 정의
│   │   └── app_constants.dart
│   └── extensions/              # 확장 메서드
│       ├── context_extension.dart
│       └── date_time_extension.dart
├── data/
│   └── models/                  # 데이터 모델
│       ├── user_model.dart
│       └── fortune_model.dart
├── domain/                      # 비즈니스 로직 (예정)
│   └── entities/
├── presentation/                # UI 화면
│   ├── pages/
│   │   ├── splash_screen.dart
│   │   ├── home_screen.dart
│   │   ├── fortune_screen.dart
│   │   ├── history_screen.dart
│   │   └── profile_screen.dart
│   └── widgets/
└── services/                    # 서비스
    ├── api_service.dart
    ├── fortune_service.dart
    └── auth_service.dart
```

## 🛠️ 설치 및 실행

### 사전 요구사항
- Flutter SDK 3.0+
- Dart SDK 3.0+
- iOS: Xcode
- Android: Android Studio

### 설치
```bash
cd app
flutter pub get
```

### 코드 생성 (JSON 직렬화)
```bash
flutter pub run build_runner build
```

### 앱 실행
```bash
# 디버그 모드
flutter run

# iOS
flutter run -d iphone

# Android
flutter run -d android
```

## 📦 주요 의존성

- **Riverpod**: 상태 관리
- **Dio**: HTTP 클라이언트
- **Json Serializable**: JSON 직렬화
- **Hive**: 로컬 저장소
- **Google Fonts**: 폰트
- **Intl**: 국제화

## 🎨 테마 시스템

### Dark/Light Mode
- 자동 시스템 테마 적용
- 수동 테마 전환 가능
- 모든 색상 일관성 유지

### 색상 시스템
- Primary: Purple (#6B5B95)
- Secondary: Orange (#F39C12)
- Five Elements: 오행의 5가지 색상

## 🌐 API 통신

### BaseUrl
```
Development: http://localhost:8000
Production: https://api.miki.app
```

### Endpoints (planned)
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /fortune/analyze` - 사주 분석
- `GET /fortune/daily` - 오늘의 운세
- `GET /fortune/monthly` - 월간 운세
- `GET /fortune/yearly` - 연간 운세

## 📋 다음 할 일

- [ ] API 서비스 구현
- [ ] 인증 플로우 (회원가입/로그인)
- [ ] 사주 분석 화면 UI
- [ ] 운세 조회 화면
- [ ] 히스토리 화면
- [ ] 프로필 화면
- [ ] 로컬 데이터 캐싱
- [ ] 에러 핸들링
- [ ] 테스트 코드 작성

## 🚀 빌드

### iOS Release
```bash
flutter build ios --release
```

### Android Release
```bash
flutter build appbundle --release
```

## 📝 라이센스

[라이센스 추후 지정]
