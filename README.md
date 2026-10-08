# 🔮 Miki (미키사주)

Oriental Fortune & Destiny Reader App | iOS & Android Compatible

## 📱 프로젝트 소개

**Miki(미키사주)**는 동양학 기반의 사주, 점성술, 타로 등 다양한 운세를 제공하는 크로스플랫폼 모바일 앱입니다.

### MVP (1차) 기능
- ✅ 동양학 사주 (사주팔자)
- ✅ 올해사주
- ✅ 이달의사주
- ✅ 오늘의사주운세
- ✅ 다크/라이트 모드 완전 지원

### Phase 2 계획 (추후)
- 자미두수
- 점성술
- 서양사주
- 타로
- 통합 분석 (사주 입력 후 모든 운세 한번에 조회)
- 토정비결
- 일자별운세

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Theme**: Dark/Light Mode Native Support
- **Platforms**: iOS, Android

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL
- **Deployment**: AWS EC2 / Railway
- **API**: RESTful API

### Tools
- **Version Control**: Git & GitHub
- **Package Manager**: pub (Flutter), pip (Python)

---

## 📁 프로젝트 구조

```
miki/
├── app/                          # Flutter 앱
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   ├── features/
│   │   ├── services/
│   │   └── theme/
│   ├── pubspec.yaml
│   └── README.md
│
├── backend/                       # Python FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── services/
│   │   ├── routers/
│   │   └── core/
│   ├── requirements.txt
│   ├── docker-compose.yml
│   └── README.md
│
├── docs/                          # 문서
│   ├── API_SPEC.md
│   ├── SETUP.md
│   └── ARCHITECTURE.md
│
└── README.md
```

---

## 🚀 시작하기

### 사전 요구사항
- Flutter SDK 3.0+
- Python 3.9+
- PostgreSQL 12+
- Git

### 설치 및 실행

#### Backend 설정
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### App 설정
```bash
cd app
flutter pub get
flutter run
```

자세한 설정은 [SETUP.md](docs/SETUP.md)를 참고하세요.

---

## 📊 개발 로드맵

| Phase | 내용 | 기간 |
|-------|------|------|
| Phase 1 | MVP (사주/올해사주/이달사주/오늘운세) | 2-3주 |
| Phase 2 | 추가 점술 통합 (자미두수, 점성술, 타로) | 4-6주 |
| Phase 3 | 통합 분석 & 고급 기능 | 진행중 |
| Phase 4 | 글로벌 확장 & 다언어 지원 | 추후 |

---

## 👥 팀 구성

- **기획/프로듀싱**: inspressooffical-star
- **개발**: Copilot

---

## 📝 라이센스

[라이센스 추후 지정]

---

## 📧 문의

프로젝트 관련 문의는 GitHub Issues를 통해 주세요.

---

**Let's create the ultimate Oriental Fortune app! 🔮✨**