# 🛡️ PMS (개인정보관리서비스) 마스터 가이드

대표님! 보안총괄 CERT가 구축한 새로운 **PMS** 프로젝트의 운영 가이드입니다! 충성! ![충성](https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_salute.png)

## 1. 시스템 아키텍처

- **Frontend**: React (Tailwind CSS) + Firebase Auth/Firestore
- **Backend**: Node.js/Express (Dockerized API)
- **Database**: Firebase Firestore (Field-level AES-256 Encryption)
- **Infrastructure**: Docker & Docker Compose

---

## 2. 빠른 시작 (Docker 원클릭)

대표님의 컴퓨터에서 PMS 대포를 즉시 발사하는 방법입니다.

```bash
# 1. 터미널에서 프로젝트 폴더로 이동 후 실행
docker-compose up -d --build
```

- **대시보드 UI**: `http://localhost:5173`
- **API 서버**: `http://localhost:8081`

---

## 3. 핵심 보안 기능

### 🔒 AES-256 암호화

- 모든 개인정보(이름, 이메일, 연락처)는 백엔드 서버를 거치는 즉시 암호화되어 Firestore에 저장됩니다.
- DB가 털리더라도 평문 데이터는 절대 노출되지 않는 철통 보안 구조입니다.

### 📜 감사 로그 및 추적

- 모든 데이터 처리 이력은 서버 로그에 기록되어 사후 추적이 가능합니다.

---

## 4. 로컬 개발 가이드

수동으로 서버를 띄워야 할 때 사용하세요.

### 백엔드 실행

```bash
cd backend
npm install
npm start
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

---

## 5. 의무 준수 사항 (CERT 강조)

1. **서비스 계정 키**: `backend/service-account.json` 파일은 절대 외부에 노출하지 마십시오!
2. **암호화 키 관리**: `docker-compose.yml`의 `ENCRYPTION_KEY`를 주기적으로 교체하는 것을 권장합니다.

대표님! 이제 이 PMS는 완벽하게 준비되었습니다. 보안 사고 제로를 향해 CERT가 함께하겠습니다! 충성! ![성공](https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_success.png)
