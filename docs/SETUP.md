# 개발 환경 설정 가이드

## 🔧 사전 준비

### 1. Flutter 설정

#### 설치
```bash
# Flutter SDK 다운로드
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
```

#### 확인
```bash
flutter doctor
```

### 2. Python 환경 설정

#### Python 3.9+ 설치
```bash
python --version  # 3.9 이상 확인
```

#### 가상환경 생성
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

#### 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. PostgreSQL 설정

#### 설치 & 실행
- Windows: [PostgreSQL 공식 설치](https://www.postgresql.org/download/windows/)
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### 데이터베이스 생성
```sql
CREATE DATABASE miki_db;
CREATE USER miki_user WITH PASSWORD 'your_password';
ALTER ROLE miki_user SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE miki_db TO miki_user;
```

---

## 🚀 로컬 개발 실행

### Backend 실행
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API Docs: http://localhost:8000/docs

### App 실행
```bash
cd app
flutter pub get
flutter run
```

---

## 📝 환경 변수 설정

### Backend (.env)
```
DATABASE_URL=postgresql://miki_user:password@localhost/miki_db
JWT_SECRET=your_secret_key
API_PORT=8000
ENVIRONMENT=development
```

### App (lib/core/config.dart)
```dart
class AppConfig {
  static const String apiBaseUrl = 'http://127.0.0.1:8000';
  static const String apiVersion = 'v1';
}
```

---

## 🐳 Docker로 실행 (선택)

```bash
cd backend
docker-compose up -d
```

---

## ✅ 체크리스트

- [ ] Flutter SDK 설치 완료
- [ ] Python 3.9+ 설치 완료
- [ ] PostgreSQL 설치 & 데이터베이스 생성 완료
- [ ] Backend 환경변수 설정 완료
- [ ] Backend 실행 확인 (http://localhost:8000/docs)
- [ ] App 실행 확인

---

문제 발생 시 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)를 참고하세요.