# Miki API Specification

## 🔌 Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.miki.app/api/v1
```

---

## 👤 인증 (Authentication)

### POST /auth/register

사용자 회원가입

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /auth/login

로그인

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## 🔮 사주 (Fortune)

### POST /fortune/analyze

사주 분석 (생년월일시 입력)

**Request:**
```json
{
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "gender": "M"
}
```

**Response (200):**
```json
{
  "id": 123,
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "heavenly_stem": "庚",
  "earthly_branch": "午",
  "five_elements": {
    "wood": 2,
    "fire": 3,
    "earth": 1,
    "metal": 2,
    "water": 1
  },
  "personality": "독립적이고 적극적인 성향...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /fortune/daily

오늘의 운세

**Query Parameters:**
- `date` (optional): YYYY-MM-DD 형식, 기본값은 오늘
- `fortune_id` (required): 사주 ID

**Response (200):**
```json
{
  "date": "2024-01-15",
  "overall_luck": 7,
  "health": 8,
  "love": 6,
  "wealth": 7,
  "work": 8,
  "fortune_text": "오늘은 긍정적의 에너지...",
  "lucky_color": "#FF6B6B",
  "lucky_number": 7
}
```

### GET /fortune/monthly

이달의 운세

**Query Parameters:**
- `month` (required): YYYY-MM 형식
- `fortune_id` (required): 사주 ID

**Response (200):**
```json
{
  "month": "2024-01",
  "overall_luck": 6,
  "health": 7,
  "love": 5,
  "wealth": 8,
  "work": 7,
  "forecast": "새해의 시작으로 전반적의 흐름...",
  "key_dates": [
    {
      "date": "2024-01-15",
      "event": "길한 날",
      "description": "계약, 시작에 좋은 날"
    }
  ]
}
```

### GET /fortune/yearly

올해 운세

**Query Parameters:**
- `year` (required): YYYY 형식
- `fortune_id` (required): 사주 ID

**Response (200):**
```json
{
  "year": "2024",
  "overall_luck": 6,
  "health": 7,
  "love": 6,
  "wealth": 7,
  "work": 8,
  "yearly_theme": "변화와 성장의 해",
  "quarterly_forecast": [
    {
      "quarter": 1,
      "luck": 6,
      "description": "1분기는 시작과 준비의 시간..."
    }
  ]
}
```

### GET /fortune/history

사주 분석 이력 조회

**Response (200):**
```json
{
  "items": [
    {
      "id": 123,
      "birth_date": "1990-01-15",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

---

## 👥 사용자 (User)

### GET /user/profile

사용자 프로필 조회

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "fortunes_count": 5
}
```

### PUT /user/profile

사용자 프로필 업데이트

**Request:**
```json
{
  "name": "Jane Doe"
}
```

---

## 🏥 헬스체크

### GET /health

서버 상태 확인

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

---

## ⚠️ 에러 응답

### 공통 에러 형식
```json
{
  "error": "ERROR_CODE",
  "message": "사용자 친화적 메시지",
  "details": "기술적 세부사항 (선택)"
}
```

### 에러 코드
| Code | Status | 설명 |
|------|--------|------|
| INVALID_REQUEST | 400 | 잘못된 요청 |
| UNAUTHORIZED | 401 | 인증 실패 |
| FORBIDDEN | 403 | 권한 없음 |
| NOT_FOUND | 404 | 리소스 없음 |
| CONFLICT | 409 | 중복 데이터 |
| SERVER_ERROR | 500 | 서버 에러 |

---

## 📝 요청/응답 헤더

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Response Headers
```
Content-Type: application/json
X-Request-ID: {uuid}
X-Response-Time: {ms}
```

---

## 📚 예시 (cURL)

### 회원가입
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 로그인
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 사주 분석
```bash
curl -X POST http://localhost:8000/api/v1/fortune/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "birth_date": "1990-01-15",
    "birth_time": "14:30:00",
    "gender": "M"
  }'
```

### 오늘의 운세
```bash
curl http://localhost:8000/api/v1/fortune/daily?fortune_id=123 \
  -H "Authorization: Bearer {token}"
```

---

## ℹ️ 버전 관리

| Version | Status | Release Date |
|---------|--------|----------|
| 1.0.0 | Development | 2024-01 |
| 1.1.0 | Planned | Q2 2024 |
| 2.0.0 | Planned | Q3 2024 |

---

마지막 업데이트: 2024년 1월