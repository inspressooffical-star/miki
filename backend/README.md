# 🔮 Miki FastAPI Backend

Oriental Fortune & Destiny Reader - Python FastAPI Backend

## 🏗️ 프로젝트 구조

```
backend/
app/
├── main.py                 # FastAPI 앱 진입점
├── core/
│   ├── config.py          # 설정 (DB URL, JWT 등)
│   ├── database.py        # SQLAlchemy DB 설정
│   └── security.py        # JWT, 비밀번호 암호화
├── models/
│   ├── user.py           # User 모델 (ORM)
│   └── fortune.py        # Fortune 모델 (ORM)
├── schemas/
│   ├── user.py           # User 요청/응답 스키마 (Pydantic)
│   └── fortune.py        # Fortune 요청/응답 스키마
├── routers/
│   ├── auth.py           # 인증 엔드포인트
│   ├── fortune.py        # 사주 엔드포인트
│   └── health.py         # 헬스체크
├── services/
│   └── fortune_engine.py  # 사주 계산 엔진
└── requirements.txt       # Python 패키지
```

## 🛠️ 설치 및 실행

### 사전 요구사항
- Python 3.9+
- PostgreSQL 12+

### 설치
```bash
cd backend

# 가상환경 생성
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
```

### 환경변수 설정 (.env)
```
DATABASE_URL=postgresql://miki_user:password@localhost:5432/miki_db
JWT_SECRET=your-secret-key-change-in-production
ENVIRONMENT=development
```

### 실행
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API Docs: http://localhost:8000/docs

## 📚 API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인

### 사주
- `POST /api/v1/fortune/analyze` - 사주 분석
- `GET /api/v1/fortune/daily?fortune_id=123&date=2024-01-15` - 오늘의 운세
- `GET /api/v1/fortune/monthly?fortune_id=123&month=2024-01` - 월간 운세
- `GET /api/v1/fortune/yearly?fortune_id=123&year=2024` - 연간 운세

### 헬스체크
- `GET /health` - 서버 상태 확인

## 🔑 JWT 인증

로그인 후 받은 access_token을 요청 헤더에 포함:
```
Authorization: Bearer {access_token}
```

## 📊 데이터베이스 모델

### users 테이블
- id: 사용자 ID
- email: 이메일 (유니크)
- hashed_password: 해시된 비밀번호
- name: 이름
- created_at: 가입 날짜

### fortunes 테이블
- id: 사주 ID
- user_id: 사용자 ID (FK)
- birth_date: 생년월일
- birth_time: 생시 (선택)
- gender: 성별 (M/F)
- heavenly_stem: 천간
- earthly_branch: 지지
- five_elements: 오행 (JSON)
- personality: 성격 설명

### daily_fortunes 테이블
- id: 일자별 운세 ID
- fortune_id: 사주 ID (FK)
- fortune_date: 운세 날짜
- overall_luck: 전체 운
- health, love, wealth, work: 각 분야 운

## 🚀 다음 할 ���

- [ ] 데이터베이스 마이그레이션 (Alembic)
- [ ] JWT 미들웨어 구현
- [ ] 사주 계산 엔진 고도화 (음력 변환)
- [ ] 에러 핸들링 강화
- [ ] 유닛 테스트 작성
- [ ] API 문서화 완료
- [ ] Docker 구성

## 📝 라이센스

[라이센스 추후 지정]
