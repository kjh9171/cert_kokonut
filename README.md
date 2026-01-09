# 비즈가드 (BizGuard) 🛡️

**대한민국 소상공인과 프리랜서를 위한 통합 경영 관리 & 개인정보 보호 플랫폼**

비즈가드(BizGuard)는 복잡한 재무 관리(장부, 매출 예측)와 까다로운 개인정보 보호 업무(보안 금고, 문서 생성)를 하나의 플랫폼에서 손쉽게 해결할 수 있도록 돕습니다.

---

## ✨ 최근 업데이트 (Latest Updates)

### 🎨 밝고 안전한 디자인 (Bright & Secure Design)
- 전체 UI 테마를 어두운 색상에서 **밝고 전문적인 신뢰감**을 주는 디자인으로 전면 개편하였습니다.
- 가독성 향상을 위해 고대비 텍스트와 선명한 파란색(Primary), 안전을 상징하는 녹색(Accent)을 적용하였습니다.

### 📋 개인정보처리방침 생성기 개선
- 개인정보보호위원회 최신 가이드를 100% 준수한 **15개 필수 항목**을 지원합니다.
- 복잡한 법적 문구를 마법사 형태의 6단계 질문을 통해 누구나 쉽게 생성할 수 있습니다.

---

## 🚀 주요 기능 (Features)

### 1. 💰 스마트한 재무 관리 (Financial Intelligence)
- **간편 장부**: 수입/지출 내역을 손쉽게 기록하고 관리할 수 있습니다.
- **엑셀 데이터 연동**: 기존에 사용하던 엑셀 장부를 업로드하면 자동으로 분석됩니다.
- **AI 매출 예측**: 업로드된 데이터를 기반으로 다음 달 예상 매출 리포트를 제공합니다.

### 2. 🔒 철저한 개인정보 보호 (Privacy Guard)
- **보안 금고 (Secure Vault)**: 계약서, 직원 명부 등 민감한 문서를 AES-256 암호화하여 안전하게 보관합니다.
- **15개 필수 항목 방침 생성**: 법적 규정에 맞는 완벽한 개인정보처리방침을 생성합니다.
- **CCTV 및 제3자 제공 관리**: 복잡한 개인정보 처리 위탁 및 제공 사항을 명확하게 규정합니다.

### 3. 🛡️ 플랫폼 관리자 시스템 (Admin Portal)
- **회원 관리**: 가입한 사용자 목록을 조회하고, 상태(활성/정지/PW 초기화)를 관리합니다.
- **시스템 모니터링**: 실시간 시스템 가동률 및 보안 위험 요소를 모니터링합니다.

---

## 🐳 Docker 배포 가이드 (Deployment)

본 프로젝트는 Docker 및 Docker Compose를 통해 간편하게 실행할 수 있습니다.

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/bizguard.git
cd bizguard

# 2. Docker Compose 실행 (빌드 포함)
docker-compose up -d --build
```
브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

---

## ⚙️ 로컬 개발 실행 (Local Development)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

---

## 🛠️ 기술 스택 (Tech Stack)
- **Framework**: Next.js 15 (App Router, Standalone mode for Docker)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Bright Theme), shadcn/ui
- **State Management**: Zustand (Persist Middleware)
- **Security**: AES-256 Encryption, PIPA Compliance Helper
- **Infrastructure**: Docker, Docker Compose

---

© 2024 **BizGuard**. All rights reserved. | 대표자: 김종환
