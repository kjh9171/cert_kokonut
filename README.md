# PMS Center (Personal information Management Service)
개인정보 관리 및 보안 컴플라이언스 통합 플랫폼

Secured by CERT Total Management Team

PMS 센터는 기업의 소중한 자산인 개인정보를 보호하고, 복잡한 보안 컴플라이언스를 지능적으로 해결하기 위한 엔터프라이즈급 보안 솔루션입니다. 브라우저 기반의 강력한 암호화 엔진과 AI 정책 에이전트, 그리고 전방위 행위 감사 시스템을 통해 완벽한 데이터 거버넌스를 실현합니다.

## 1. 핵심 보안 전술 (Core Security Features)

### AI 지능형 정책 에이전트 (Privacy AI Agent)
- 개인정보 처리방침 자동 생성: 법적 필수 항목이 포함된 정책 초안을 즉시 작성합니다.
- 대화형 정책 개정 보좌: 사용자 요구사항을 분석하여 기존 정책을 실시간으로 수정 및 재작성합니다.
- 버전 관리: 모든 개정 이력을 DB에 보관하여 컴플라이언스 대응력을 강화합니다.

### 전방위 보안 감사 로그 (Total Audit Trail)
- 무결점 행위 추적: 로그인, 데이터 접근, 이용자 관리, 정책 수정 등 모든 시스템 행위를 기록합니다.
- 실시간 모니터링: 운영 대시보드를 통해 누가, 언제, 어떤 리소스에 접근했는지 초 단위로 감시합니다.
- 책임 추적성 보장: 모든 로그에 행위자 식별 정보를 매핑하여 내부 부정 행위를 원천 차단합니다.

### 고성능 보안 금고 (Security Vault)
- 로컬 암/복호화 엔진: Web Crypto API(AES-GCM)를 사용하여 대용량 엑셀 데이터를 서버 전송 없이 브라우저 메모리 내에서 즉시 처리합니다.
- 자동 데이터 매핑: 엑셀 헤더를 분석하여 성명, 연락처 등 민감 정보를 분류하고 보안 DB로 자동 전송합니다.

### 다중 레이어 보안 인증 (Multi-Layer Auth)
- 2단계 인증 (OTP): TOTP 기반 2FA를 탑재하여 일반/구글 로그인 시 강력한 2차 방어막을 제공합니다.
- 정밀 권한 제어 (ACL): 메뉴 단위의 접근 권한을 관리자가 실시간으로 통제하고 영구 저장합니다.
- 1시간 보안 세션: 모든 세션은 60분 후 자동 만료되며, 서버 통신 기반의 실제 토큰 갱신(RENEW) 기능을 지원합니다.

## 2. 비즈니스 운영 가이드 (Operation Guide)

### 즉시 체험 모드 (Sandbox)
- 잠재 고객은 별도의 가입 절차 없이 랜딩 페이지에서 즉시 모든 주요 보안 기능을 테스트할 수 있습니다.

### 라이선스 및 구독 모델
- 일반 이용자: 가입 시 30일 고유 라이선스 키가 자동 발급되며, 만료 시 기능이 제한됩니다.
- 구독 유도: 권한 제한 및 만료 시 세련된 안내 화면을 통해 프리미엄 플랜 결제를 유도합니다.
- 관리자 권한: 모든 유저의 라이선스 날짜와 권한을 자유자재로 설정하고 관리할 수 있습니다.

## 3. 기술 사양 및 설치 (Technical Stack)

### Stack
- Frontend: React (Vite), Tailwind CSS, Lucide Icons, Recharts
- Backend: Node.js (Express), JWT (JsonWebToken)
- Security: Web Crypto API (AES-256), TOTP (Speakeasy), Bcrypt
- Infrastructure: Docker, Docker-Compose (Serverless Architecture)

### Deployment (Docker)
본 프로젝트는 도커 기반으로 설계되어 단 한 번의 명령으로 전체 보안 환경을 구축할 수 있습니다.

1. 의존성 설치 및 이미지 빌드
   docker-compose up --build

2. 서비스 접속
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8081

## 4. 보안 운영 절차 (SOP)

1. 최초 관리자 가입: 서비스 개설 시 최초 가입자에게 마스터 관리자 권한 및 무제한 라이선스가 부여됩니다.
2. 팀원 추가 및 통제: '이용자 계정 관리' 메뉴에서 팀원을 추가하고 업무에 맞는 권한과 라이선스 만료일을 지정하십시오.
3. 정책 수립: AI 에이전트의 보좌를 받아 기업 특성에 맞는 개인정보 처리방침을 수립하고 게시하십시오.
4. 상시 감사: 운영 대시보드의 실시간 로그를 통해 부정한 데이터 접근이나 보안 위협이 없는지 정기적으로 점검하십시오.

## 5. 데이터베이스 통합 관리 지침 (Database Management)

PMS 센터는 경량화와 고성능 유지를 위해 JSON 기반의 파일 데이터베이스를 사용합니다.

### 데이터베이스 위치 및 구조
- **물리적 경로:** `backend/local_db.json`
- **도커 매핑:** 컨테이너 내부의 `/app/local_db.json` 경로와 호스트 시스템의 파일이 실시간 동기화(Docker Volume)되어 데이터 영속성이 보장됩니다.
- **주요 컬렉션:**
  - `pms_admins`: 이용자 계정 정보, 권한(ACL), 라이선스, OTP 설정 등 보관
  - `privacy_records`: 보안 금고를 통해 업로드된 회원 자산 데이터
  - `security_logs`: 전방위 시스템 행위 감사 로그
  - `policies`: AI 에이전트로 생성된 약관 및 처리방침 이력

### 직접 관리 및 백업 방법
1. **계정 수동 복구:** 관리자 비밀번호 분실 시 `local_db.json`을 열어 `pms_admins` 섹션의 비밀번호 해시를 직접 수정하거나 신규 계정을 삽입할 수 있습니다.
2. **라이선스 강제 조정:** 특정 이용자의 `licenseExpiry` 날짜를 JSON 상에서 직접 수정하여 서비스 기간을 즉시 연장할 수 있습니다.
3. **데이터 백업:** `local_db.json` 파일을 정기적으로 다른 안전한 저장소(Cold Storage)에 복사하는 것만으로도 완벽한 백업이 완료됩니다.
4. **주의사항:** 파일을 수동으로 편집한 후에는 변경사항을 안정적으로 적용하기 위해 백엔드 컨테이너를 재시작하는 것을 권장합니다. (`docker-compose restart pms-backend`)

---
© 2026 PMS CENTER INC. SECURED BY CERT TEAM. ALL RIGHTS RESERVED.
