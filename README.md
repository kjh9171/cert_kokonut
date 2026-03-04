# 🛡️ PMS Center - 지능형 개인정보 관리 통합 플랫폼

![PMS Center Banner](https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_success.png)

## 1. 시스템 개요

PMS Center는 기업의 개인정보 보호와 컴플라이언스 대응을 자동화하는 고성능 보안 플랫폼입니다. 강력한 시각화 대시보드와 암호화 엔진을 기반으로 기업의 보안 리스크를 원스톱으로 관리합니다.

### 기술 스택 (Tech Stack)

- Frontend: React.js (Vite Core), Lucide Icons, Recharts (Data Visualization)
- UI/UX: Vanilla CSS 기반 프리미엄 디자인, 반응형 레이아웃, 다크 모드 지원
- Backend: Node.js/Express (Dockerized Microservices)
- Database: Firebase Auth & Firestore (Field-level AES-256 Encryption)
- Infrastructure: Docker & Docker Compose (Zero-config Deployment)

---

## 2. 빠른 시작 (Quick Start)

대표님의 서버 환경에서 PMS Center를 즉시 가동하는 방법입니다.

```bash
# 터미널에서 프로젝트 루트 디렉토리로 이동 후 실행
docker-compose down && docker-compose up -d --build
```

- 운영 대시보드 (사용자용): http://localhost:5173
- 통합 관제 센터 (시스템용): http://localhost:5173 (로그인 후 데모 버튼 클릭)
- API 서버 엔진: http://localhost:8081

---

## 3. 핵심 시스템 모듈

### 📊 통합 관제 센터 (System Ops)

- 실시간 트래픽 분석 차트 (Recharts 연동)
- 노드별 서버 헬스 체크 및 리소스 모니터링
- 다크 테마 기반의 전문적인 제어 인터페이스

### �️ 지능형 보안 엔진

- 데이터 암호화: AES-256 대칭키 암호화 및 AWS KMS 수준의 키 관리 시뮬레이션
- 컴플라이언스 자동화: ISMS-P 인증에 필요한 증적 자료 관리 프레임워크 제공
- 데이터 영속성: 브라우저 로컬 저장소를 활용한 설정 정보 실시간 동기화

### 🏢 기업 관리 대시보드

- 직관적인 지표 카드 시스템
- 사이드바 확장/축소를 통한 업무 몰입도 향상
- 회사 정보 개정 및 보안 정책 관리

---

## 4. 로컬 개발 환경 구성

수동으로 각 모듈을 제어해야 할 때 사용하세요.

### Backend Engine 기동

```bash
cd backend
npm install
npm start
```

### Frontend UI 가동

```bash
cd frontend
npm install
npm run dev
```

---

## 5. 보안 및 운영 필독 사항 (CERT 총괄 강조)

1. 서비스 계정 인증: backend/service-account.json 파일은 반드시 대표님의 실제 Firebase 키 파일로 교체해야 데이터 영속성이 100% 보장됩니다.
2. 암호화 키 관리: docker-compose.yml 내의 ENCRYPTION_KEY 값을 정기적으로 개정하여 보안 강도를 유지하십시오.
3. 세션 종료 프로토콜: 업무 종료 시 사이드바 하단의 '시스템 종료(TERMINATE)' 버튼을 사용하여 안전하게 로그아웃할 것을 권장합니다.

© 2026 PMS Center Inc. All Assets Secured by CERT.
