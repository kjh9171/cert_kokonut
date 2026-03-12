# Antigravity PMS Center (Secured by CERT)
클라우드 통합 개인정보 관리 및 지능형 보안 플랫폼

본 플랫폼은 기업의 개인정보 보호 체계를 자동화하고, 최신 법령을 스스로 학습하는 AI 인텔리전스를 탑재한 차세대 보안 솔루션입니다. Vercel 서버리스 아키텍처와 MongoDB Atlas 클라우드 DB를 통해 전 세계 어디서나 안전하고 빠른 보안 거버넌스를 실현합니다.

## 1. 지능형 보안 아키텍처 (Intelligence Architecture)

### Legal Intelligence Engine (지능형 법률 엔진)
- 실시간 법령 학습: 국가법령정보센터 및 글로벌 테크 기업의 방침 패턴을 주기적으로 동기화하여 지식 베이스(Law Knowledge)를 구축합니다.
- Smart Refiner: 사용자가 입력한 거친 메모를 최신 법령(PIPA 2025) 기준에 맞춘 전문적인 법률 문구로 정밀 정제합니다.
- RAG 기반 생성: 학습된 최신 지식을 바탕으로 가장 안전하고 표준화된 개인정보 처리방침을 자동으로 설계합니다.

### Cloud-Native Security (클라우드 보안)
- Vercel Serverless: 인프라 관리 부담 없는 서버리스 환경에서 고가용성 API 서비스를 제공합니다.
- MongoDB Atlas: 글로벌 분산 클라우드 DB를 통해 데이터 무결성과 보안을 완벽하게 보장합니다.
- DB Connection Caching: 서버리스 환경의 성능 최적화를 위해 효율적인 커넥션 풀링 기법을 적용했습니다.

### Security Vault v2.5 (보안 금고 고도화)
- **분산형 키 조합 엔진**: 서버에서 제공하는 동적 Salt와 사용자 비밀번호를 클라이언트측 PBKDF2로 조합하여 마스터 키를 생성합니다. 서버에는 개인키를 절대 저장하지 않는 '무저장 원칙'을 준수합니다.
- **물리적 데이터 소각 (Hard Delete)**: 복호화 성공 즉시 서버 내의 암호화 레코드를 DB 수준에서 완전히 삭제하여 데이터 흔적을 말소합니다.
- **메모리 보안 강화**: 작업 완료 후 브라우저 메모리 내 민감 변수를 명시적으로 해제(null 대입)하여 메모리 덤프 공격을 방어합니다.

### Intelligence Engine v2.5 (AI 고도화)
- **대화형 정책 정정 (Legal Chat)**: 단순 생성을 넘어 사용자와의 대화를 통해 개인정보 처리방침을 실시간으로 수정하고 반영하는 지능형 인터페이스를 탑재했습니다.
- **RAG 컨텍스트 연동**: 최신 법령 데이터베이스와 실시간 연동되어 가장 정확한 법률 조항을 기반으로 보안 문서를 설계합니다.

### Admin Monitoring (관제 고도화)
- **실시간 보안 대시보드**: Recharts를 활용하여 전체 보안 활동(암호화/복호화/소각)을 시계열 데이터로 시각화하여 관제 효율을 높였습니다.
- **심화 다크 모드**: 전문가용 고대비 다크 모드 테마를 적용하여 장시간 보안 관제 시의 피로도를 획기적으로 낮췄습니다.

## 2. 배포 및 환경 설정 (Deployment Guide)

### Vercel 배포 설정
본 프로젝트는 루트 디렉토리의 `vercel.json`을 통해 전체 빌드 및 라우팅을 제어합니다.

1. **Build Command:** `npm run build`
2. **Output Directory:** `.` (루트)
3. **Environment Variables (필수):**
   - `MONGODB_URI`: MongoDB Atlas 연결 문자열 (예: `mongodb+srv://...`)
   - `JWT_SECRET`: 보안 토큰용 난수 키
   - `PAYPAL_CLIENT_ID`: 페이팔 샌드박스/라이브 클라이언트 ID
   - `PAYPAL_CLIENT_SECRET`: 페이팔 시크릿 키

### 로컬 개발 환경
```bash
# 전체 의존성 설치
npm install

# 백엔드 실행 (localhost:8080)
cd backend && npm run dev

# 프론트엔드 실행 (localhost:5173)
cd frontend && npm run dev
```

## 3. 데이터베이스 운영 지침 (Database Management)

외부 MongoDB(Atlas)를 안전하게 관리하고 접속하는 방법입니다.

### 클라우드 DB 접속 (MongoDB Compass)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 로그인 후 'Connect' 메뉴에서 연결 문자열을 복사합니다.
2. [MongoDB Compass](https://www.mongodb.com/products/compass) 설치 및 실행 후 URI를 입력하여 접속합니다.
3. **주요 컬렉션 관리:**
   - `admins`: 관리자 계정 및 ACL(권한) 데이터
   - `privacyrecords`: 보안 금고를 통해 적재된 암호화 회원 자산
   - `securitylogs`: 전방위 시스템 감사 로그 (필터 기능을 활용해 특정 행위 추적 가능)
   - `lawknowledges`: AI가 학습한 최신 법령 조항 및 패턴

### 유지보수 및 백업
- **유저 권한 조정:** `admins` 컬렉션에서 특정 유저의 `permissions` 배열을 수정하여 즉시 권한을 통제할 수 있습니다.
- **데이터 백업:** Atlas 대시보드의 'Backup' 기능을 활성화하여 정기적인 스냅샷을 생성하십시오.
- **시스템 초기화:** 신규 환경 배포 시 `/api/admin/init` 엔드포인트를 호출하여 마스터 계정을 자동 생성할 수 있습니다.

## 4. 업데이트 및 유지보수 가이드 (Maintenance SOP)

### AI 지식 베이스 최신화
- 관리자 페이지 상단의 'Refresh' 아이콘을 클릭하거나, `POST /api/admin/knowledge/sync` API를 호출하여 최신 법령 데이터를 강제 동기화할 수 있습니다.

### 대형 라이브러리 업데이트 시 주의사항
- `frontend/vite.config.js`의 `manualChunks` 설정을 정기적으로 확인하십시오. 특정 라이브러리가 비대해져 빌드가 멈출 경우, 해당 라이브러리를 새로운 청크로 분리해야 합니다.

### 보안 패치 절차
1. Vercel 대시보드에서 배포 로그를 상시 모니터링하십시오.
2. `backend/server.js` 수정 시 DB 커넥션 캐싱 로직(`cachedDb`)이 훼손되지 않도록 주의하십시오.

---
© 2026 PMS CENTER INC. SECURED BY CERT TEAM. ALL RIGHTS RESERVED.
