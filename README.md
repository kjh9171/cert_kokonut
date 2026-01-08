# 비즈가드 (BizGuard) 🛡️

**대한민국 소상공인과 프리랜서를 위한 통합 경영 관리 & 개인정보 보호 플랫폼**

비즈가드(BizGuard)는 복잡한 재무 관리(장부, 매출 예측)와 까다로운 개인정보 보호 업무(보안 금고, 문서 생성)를 하나의 플랫폼에서 손쉽게 해결할 수 있도록 돕습니다.

---

## 🚀 주요 기능 (Features)

### 1. 💰 스마트한 재무 관리 (Financial Intelligence)
- **간편 장부**: 수입/지출 내역을 손쉽게 기록하고 관리할 수 있습니다.
- **엑셀 데이터 연동**: 기존에 사용하던 엑셀 장부를 업로드하면 자동으로 분석됩니다.
- **AI 매출 예측**: 업로드된 데이터를 기반으로 다음 달 예상 매출 리포트를 제공합니다.
- **개인별 데이터 격리**: 사용자의 재무 데이터는 타인과 완벽하게 격리됩니다.

### 2. 🔒 철저한 개인정보 보호 (Privacy Guard)
- **보안 금고 (Secure Vault)**: 계약서, 직원 명부 등 민감한 문서를 AES-256 암호화하여 안전하게 보관합니다.
- **관리자 접근 불가**: 플랫폼 관리자조차 사용자의 암호화된 문서를 열람할 수 없습니다.
- **방침 생성 도우미**: 복잡한 개인정보 처리방침 작성을 AI 프롬프트와 함께 도와줍니다.

### 3. 🛡️ 플랫폼 관리자 시스템 (Admin Portal)
- **회원 관리**: 가입한 사용자 목록을 조회하고, 상태(활성/정지)를 관리할 수 있습니다.
- **시스템 모니터링**: 전체 가입자 수, 서버 상태 등을 한눈에 확인합니다.
- **보안 격리**: 관리자 계정으로 로그인하더라도 개별 사용자의 데이터에는 접근할 권한이 없습니다.

---

## 📖 이용 가이드 (User Guide)

비즈가드는 **일반 사용자(소상공인)**와 **플랫폼 관리자**를 위한 별도의 접속 경로를 제공합니다.

### 🧑‍💼 일반 사용자 (User)
**"내 사업의 재무와 보안을 챙기고 싶다면"**

1. **회원가입**: `/signup` 페이지에서 이메일과 비밀번호로 가입합니다.
2. **로그인**: `/login` (메인 로그인) 페이지를 이용합니다.
3. **주요 활동**:
   - **대시보드**: 전체 현황 확인.
   - **재무 관리**: 장부 작성 및 엑셀 업로드.
   - **보안 금고**: 중요 문서 암호화 저장.

### 👮 플랫폼 관리자 (Admin)
**"서비스 전체를 관리하고 모니터링한다면"**

1. **관리자 등록**: `/admin/signup` 페이지로 접속합니다.
   - **보안 코드 (Secret Key)**가 필요합니다. (데모용 키: `super_secret_admin_key`)
2. **관리자 로그인**: `/admin/login` (관리자 전용) 페이지를 이용합니다.
   - ⚠️ 일반 로그인 페이지에서는 관리자 계정으로 로그인할 수 없습니다.
3. **주요 활동**:
   - **대시보드**: `/admin/dashboard`에서 사용자 현황 모니터링.
   - **계정 제어**: 불량 사용자 계정 정지(Suspend) 및 비밀번호 초기화.

---

## ⚙️ 설치 및 실행 (Installation)

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/bizguard.git

# 2. 프로젝트 폴더로 이동
cd bizguard

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

---

## 🛠️ 기술 스택 (Tech Stack)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand (Persist Middleware)
- **Security**: AES-256 Encryption (Client-side), OTP (2FA stub)
- **Data Handling**: xlsx (Excel Parsing), Recharts (Visualization)

---

© 2024 **BizGuard**. All rights reserved. | 대표자: 김종환
