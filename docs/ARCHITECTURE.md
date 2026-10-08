# Miki 시스템 아키텍처

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mobile App (Flutter)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ UI Layer         │  │ Theme System     │  │ Services     │  │
│  │ (Screens)        │  │ (Dark/Light)     │  │ (API Client) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────┬──────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Routers          │  │ Services         │  │ Models       │  │
│  │ (Endpoints)      │  │ (Logic)          │  │ (Validation) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│         │                   │                      │             │
│         └───────────────────┴──────────────────────┘             │
│                          ▼                                       │
│                  ┌──────────────────────┐                        │
│                  │ Fortune Calculation  │                        │
│                  │ Engine               │                        │
│                  └──────────────────────┘                        │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Users            │  │ Fortunes         │  │ Analytics    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture (Flutter)

### 폴더 구조
```
lib/
├── main.dart                 # 앱 진입점
├── core/
│   ├── config/              # 앱 설정
│   ├── constants/           # 상수
│   ├── extensions/          # 확장 기능
│   └── utils/               # 유틸리티
├── features/
│   ├── fortune/             # 사주 관련
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── home/                # 홈 화면
│   └── profile/             # 사용자 프로필
├── services/
│   ├── api_service.dart     # API 통신
│   ├── fortune_service.dart # 사주 비즈니스 로직
│   └── auth_service.dart    # 인증
└── theme/
    ├── app_theme.dart       # 테마 설정
    └── colors.dart          # 색상 정의
```

### 상태 관리 (Riverpod)
```dart
// providers.dart
final fortuneProvider = FutureProvider<Fortune>((ref) async {
  return await ref.watch(fortuneServiceProvider).getFortune(...);
});
```

---

## 🔧 Backend Architecture (FastAPI)

### 폴더 구조
```
backend/
app/
├── main.py                  # FastAPI 앱 설정
├── core/
│   ├── config.py           # 환경 설정
│   ├── constants.py        # 상수
│   └── dependencies.py     # 의존성 주입
├── models/
│   ├── user.py            # 사용자 모델
│   └── fortune.py         # 사주 모델
├── schemas/
│   ├── user.py            # 요청/응답 스키마
│   └── fortune.py
├── services/
│   ├── fortune_engine.py   # 사주 계산 엔진
│   ├── user_service.py    # 사용자 서비스
│   └── fortune_service.py # 사주 서비스
├── routers/
│   ├── fortune.py         # 사주 엔드포인트
│   ├── user.py           # 사용자 엔드포인트
│   └── health.py         # 헬스체크
└── database/
    └── db.py             # DB 연결
```

### API 엔드포인트 예시
```
GET  /api/v1/fortune/daily?date=2024-01-01
GET  /api/v1/fortune/yearly?year=2024
GET  /api/v1/fortune/monthly?month=2024-01
POST /api/v1/fortune/analyze
```

---

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fortunes Table
```sql
CREATE TABLE fortunes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    fortune_type VARCHAR(50),  -- 'daily', 'yearly', 'monthly'
    fortune_data JSONB,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 보안

### JWT 인증
```python
# Backend에서 JWT 토큰 생성
from fastapi_jwt_auth import AuthJWT

@app.post("/login")
def login(user: UserLogin, Authorize: AuthJWT = Depends()):
    access_token = Authorize.create_access_token(subject=user.email)
    return {"access_token": access_token}
```

### HTTPS
- 프로덕션: HTTPS 필수
- 개발: HTTP 사용 가능

---

## 📊 Data Flow

### 사주 조회 흐름
```
1. 사용자 생년월일시 입력
   ↓
2. Flutter App → FastAPI GET /api/v1/fortune/analyze
   ↓
3. Fortune Engine에서 계산
   ↓
4. 결과 DB 저장 (캐싱)
   ↓
5. JSON 응답 반환
   ↓
6. Flutter에서 UI 렌더링
```

---

## 🚀 Deployment

### Frontend (App Store & Play Store)
- Flutter build → APK/IPA 생성
- 스토어 배포

### Backend (AWS / Railway)
```bash
# Docker 이미지 빌드
docker build -t miki-api .

# 배포
docker push miki-api
```

---

더 자세한 정보는 API_SPEC.md를 참고하세요.