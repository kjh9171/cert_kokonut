# Cert Kokonut - 보안 재무 관리 시스템

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)

**Cert Kokonut**은 개인정보 보호를 최우선으로 하는 엔터프라이즈급 가계부 관리 서비스입니다. AES-256-GCM 암호화, MFA 인증, AI 재무 분석, 감사 로그 기능을 제공합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [사용 방법](#사용-방법)
- [API 문서](#api-문서)
- [보안 기능](#보안-기능)
- [라이선스](#라이선스)

---

## 🎯 주요 기능

### 1. **강력한 데이터 암호화**
- 모든 거래 금액과 설명은 **AES-256-GCM** 알고리즘으로 암호화되어 PostgreSQL에 저장
- 데이터베이스에 직접 접근해도 원본 데이터 확인 불가
- 관리자 로그인 후에만 복호화된 데이터 조회 가능

### 2. **다단계 인증 (MFA)**
- 서버 사이드 OTP 검증
- 비정상적인 접근 차단
- Demo 환경에서는 코드 `123456` 사용

### 3. **거래 관리**
- ✅ 수동 거래 입력 (날짜, 유형, 카테고리, 금액, 설명)
- ✅ CSV 파일 대량 업로드
- ✅ 거래 삭제 및 감사 로그 기록
- ✅ 실시간 데이터 시각화 (Chart.js)

### 4. **AI 재무 분석**
- Mock AI 엔진을 통한 재무 인사이트 제공
- 저축률, 지출 패턴, 카테고리별 분석
- 개선 제안 및 추천 사항 제공

### 5. **감사 로그**
- 모든 데이터 삭제/파기 이력 기록
- 삭제된 데이터의 암호화된 스냅샷 보관
- 관리자, 사유, 타임스탬프 기록

### 6. **반응형 UI/UX**
- Tailwind CSS 기반 모던 디자인
- 모바일/태블릿/데스크톱 완벽 지원
- 직관적인 대시보드 및 차트

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐
│   Frontend      │  Nginx (Port 80)
│   (HTML/JS)     │  - Tailwind CSS
│                 │  - Chart.js
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Backend API   │  Node.js + Express (Port 3000)
│   (server.js)   │  - 암호화/복호화
│                 │  - MFA 검증
│                 │  - AI 분석
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │  Database (Port 5432)
│   (DB)          │  - transactions (암호화된 데이터)
│                 │  - audit_logs (감사 로그)
└─────────────────┘
```

---

## 🛠️ 기술 스택

### Backend
- **Node.js** 18+
- **Express.js** 4.18
- **PostgreSQL** 15
- **crypto** (AES-256-GCM 암호화)
- **multer** (파일 업로드)
- **csv-parser** (CSV 파싱)

### Frontend
- **HTML5** / **CSS3**
- **Tailwind CSS** 3.x
- **Vanilla JavaScript** (ES6+)
- **Chart.js** 4.x
- **FontAwesome** 6.x

### DevOps
- **Docker** / **Docker Compose**
- **Nginx** (웹 서버)

---

## 🚀 설치 및 실행

### 사전 요구사항
- Docker 20.10+
- Docker Compose 2.0+

### 1. 저장소 클론
```bash
git clone https://github.com/kjh9171/cert_kokonut.git
cd cert_kokonut
```

### 2. 환경 변수 설정
`.env` 파일이 이미 포함되어 있습니다:
```env
DB_USER=admin_user
DB_PASSWORD=secure_password_123
DB_NAME=smart_finance
DB_HOST=db
ENCRYPTION_KEY=603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4
MFA_SECRET=JBSWY3DPEHPK3PXP
PORT=3000
```

> ⚠️ **프로덕션 환경에서는 반드시 새로운 암호화 키를 생성하세요!**

### 3. Docker 컨테이너 실행
```bash
docker-compose up -d
```

### 4. 서비스 확인
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

### 5. 로그 확인
```bash
docker-compose logs -f
```

### 6. 중지 및 제거
```bash
docker-compose down
docker-compose down -v  # 볼륨까지 삭제
```

---

## 📖 사용 방법

### 1. 로그인
1. 브라우저에서 http://localhost 접속
2. "Admin Login" 클릭
3. 아이디: `admin`, 비밀번호: `1234` 입력
4. MFA 코드: `123456` 입력

### 2. 거래 추가
**방법 1: 수동 입력**
1. "거래 내역" 탭 이동
2. "거래 추가" 버튼 클릭
3. 날짜, 유형, 카테고리, 금액, 설명 입력
4. "암호화하여 저장" 클릭

**방법 2: CSV 업로드**
1. "거래 내역" 탭 이동
2. "CSV 업로드" 버튼 클릭
3. "CSV 템플릿 다운로드" 클릭하여 형식 확인
4. CSV 파일 작성 (형식: `date,type,category,amount,description`)
5. 파일을 드래그 앤 드롭 또는 선택하여 업로드

**CSV 예시:**
```csv
date,type,category,amount,description
2026-01-01,income,급여,3000000,1월 급여
2026-01-05,expense,식비,50000,마트 장보기
2026-01-10,expense,교통,80000,지하철 정기권
```

### 3. AI 재무 분석
1. "AI 재무 분석" 탭 이동
2. "AI 분석 실행" 버튼 클릭
3. 분석 결과 확인:
   - 재무 요약
   - 저축률, 거래 건수, 순 저축
   - AI 인사이트 (지출 패턴, 개선 제안)

### 4. 거래 삭제
1. "거래 내역" 탭에서 삭제할 거래의 휴지통 아이콘 클릭
2. 삭제 사유 입력
3. "삭제" 버튼 클릭
4. 감사 로그에 자동 기록됨

### 5. 감사 로그 확인
1. "감사 로그" 탭 이동
2. 삭제된 거래의 이력 확인 (타임스탬프, 관리자, 사유)

---

## 📡 API 문서

### 인증 API

#### POST `/api/auth/login`
관리자 로그인 (1단계)

**Request:**
```json
{
  "username": "admin",
  "password": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login success. Proceed to MFA."
}
```

#### POST `/api/auth/mfa-verify`
MFA 인증 (2단계)

**Request:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "관리자 인증 성공"
}
```

---

### 거래 API

#### POST `/api/transactions`
단일 거래 추가

**Request:**
```json
{
  "date": "2026-01-21",
  "type": "income",
  "category": "급여",
  "amount": "3000000",
  "description": "1월 급여"
}
```

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

#### GET `/api/transactions`
모든 거래 조회 (복호화됨)

**Response:**
```json
[
  {
    "id": 1,
    "date": "2026-01-21",
    "type": "income",
    "category": "급여",
    "amount": 3000000,
    "description": "1월 급여",
    "created_at": "2026-01-21T10:00:00.000Z"
  }
]
```

#### POST `/api/transactions/upload-csv`
CSV 파일 업로드

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "imported": 5,
  "total": 5
}
```

#### DELETE `/api/transactions/:id`
거래 삭제 (감사 로그 기록)

**Request:**
```json
{
  "reason": "테스트 데이터 삭제",
  "adminUser": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted and audit log recorded"
}
```

---

### AI 분석 API

#### POST `/api/transactions/analyze`
AI 재무 분석 실행

**Response:**
```json
{
  "success": true,
  "analysis": {
    "summary": "분석 기간 동안 총 수입은 ₩3,000,000이며...",
    "keyMetrics": {
      "totalIncome": 3000000,
      "totalExpense": 500000,
      "netSavings": 2500000,
      "savingsRate": 83.3,
      "transactionCount": 10
    },
    "insights": [
      {
        "type": "positive",
        "title": "우수한 저축률",
        "message": "현재 저축률 83.3%는 매우 양호한 수준입니다."
      }
    ]
  }
}
```

---

### 감사 로그 API

#### GET `/api/audit-logs`
감사 로그 조회

**Response:**
```json
[
  {
    "id": 1,
    "action_type": "DELETE",
    "target_id": 5,
    "admin_user": "admin",
    "reason": "테스트 데이터 삭제",
    "timestamp": "2026-01-21T10:30:00.000Z",
    "has_snapshot": true
  }
]
```

#### GET `/api/audit-logs/:id/snapshot`
삭제된 데이터의 스냅샷 조회 (복호화)

**Response:**
```json
{
  "success": true,
  "snapshot": {
    "id": 5,
    "date": "2026-01-15",
    "type": "expense",
    "category": "식비",
    "amount": "50000",
    "description": "테스트 데이터"
  }
}
```

---

## 🔒 보안 기능

### 1. 데이터 암호화
- **알고리즘**: AES-256-GCM
- **키 길이**: 256비트 (32바이트)
- **IV**: 128비트 랜덤 생성
- **인증 태그**: GCM 모드로 데이터 무결성 보장

**암호화 프로세스:**
```
원본 데이터 → AES-256-GCM → IV:AuthTag:Encrypted
예: "50000" → "a1b2c3d4...:e5f6g7h8...:i9j0k1l2..."
```

### 2. MFA (Multi-Factor Authentication)
- 서버 사이드 OTP 검증
- TOTP (Time-based One-Time Password) 알고리즘
- Demo Secret: `JBSWY3DPEHPK3PXP`

### 3. 감사 로그
- 모든 삭제 작업 기록
- 삭제된 데이터의 암호화된 스냅샷 보관
- 관리자, 사유, 타임스탬프 기록

### 4. 환경 변수 관리
- 민감한 정보는 `.env` 파일로 관리
- Docker Compose에서 환경 변수 주입
- `.gitignore`에 `.env` 추가 권장

---

## 🧪 테스트

### Backend API 테스트

```bash
# 거래 추가
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-21","type":"income","category":"급여","amount":"3000000","description":"1월 급여"}'

# 거래 조회
curl http://localhost:3000/api/transactions

# AI 분석
curl -X POST http://localhost:3000/api/transactions/analyze

# 거래 삭제
curl -X DELETE http://localhost:3000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{"reason":"테스트 데이터 삭제","adminUser":"admin"}'

# 감사 로그 조회
curl http://localhost:3000/api/audit-logs
```

### 데이터베이스 직접 확인

```bash
# PostgreSQL 컨테이너 접속
docker exec -it finance_db psql -U admin_user -d smart_finance

# 암호화된 데이터 확인
SELECT id, date, type, category, amount, description FROM transactions LIMIT 5;

# 감사 로그 확인
SELECT * FROM audit_logs;
```

---

## 📂 프로젝트 구조

```
cert_kokonut/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js          # Express API 서버
├── frontend/
│   ├── Dockerfile
│   ├── index.html         # 메인 HTML
│   ├── app.js             # JavaScript 로직
│   └── transaction_template.csv  # CSV 템플릿
├── docker-compose.yml     # Docker 설정
├── .env                   # 환경 변수
└── README.md              # 이 파일
```

---

## 🔧 트러블슈팅

### 1. 컨테이너가 시작되지 않음
```bash
# 로그 확인
docker-compose logs

# 컨테이너 재시작
docker-compose restart
```

### 2. 데이터베이스 연결 실패
```bash
# DB 컨테이너 상태 확인
docker ps | grep finance_db

# DB 로그 확인
docker-compose logs db
```

### 3. 암호화 키 재생성
```bash
# 새로운 32바이트 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :80
lsof -i :3000

# docker-compose.yml에서 포트 변경
ports:
  - "8080:80"  # 80 → 8080
```

---

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📧 문의

- **GitHub**: [kjh9171/cert_kokonut](https://github.com/kjh9171/cert_kokonut)
- **Email**: kjh9171@naver.com

---

## 🎉 감사의 말

- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [FontAwesome](https://fontawesome.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/)

---

**© 2026 Cert Kokonut Financial Service. All Rights Reserved.**
