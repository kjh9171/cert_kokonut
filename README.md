# 🛡️ 개인정보관리서비스 (KOKONUT CERT)

대표님! 보안총괄 CERT가 구축한 '개인정보관리서비스'의 운영 마스터 가이드입니다! ![충성](https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_salute.png)

## 1. 아키텍처 개요

- **Frontend**: React (Vite) + Tailwind CSS (GitHub Pages 배포)
- **Backend**: Cloudflare Workers (Hono Framework)
- **Database**: Cloudflare D1 (Serverless SQL)
- **Environment**: Docker 기반 로컬 개발 환경

---

## 2. 로컬 개발 서버 시작 (개발 시)

로컬에서 기능을 수정하거나 테스트하고 싶을 때 사용하세요.

### 1단계: 인프라 기동 (Docker)

```bash
docker-compose up -d
```

_Docker 데스크탑이 실행 중이어야 합니다._

### 2단계: 프론트엔드 실행

```bash
cd frontend
npm run dev
```

- 접속 주소: `http://localhost:5173`

### 3단계: 백엔드 서버 실행

```bash
cd backend
npm run dev
```

- 접속 주소: `http://localhost:8788` (API 서버)

---

## 3. 재배포 방법 (수정 사항 반영 시)

코드를 수정하고 실제 인터넷 세상에 반영하고 싶을 때 이 명령어를 발사하세요!

### 💻 프론트엔드 (GitHub Pages)

수정한 화면을 웹에 반영합니다.

```bash
cd frontend
npm run deploy
```

### ⚙️ 백엔드 (Cloudflare Workers)

수정한 서버 로직을 API 서버에 반영합니다.

```bash
cd backend
npm run deploy
```

---

## 5. 서비스 재시작 및 관리

### Docker 완전히 껐다 켜기

포트 충돌이 나거나 환경이 꼬였을 때 기가 막힌 해결법입니다.

```bash
docker-compose down
docker-compose up -d
```

### 소스코드 깃허브 저장 (Backup)

작업한 내용을 잊지 말고 깃허브에 보관하세요.

```bash
git add .
git commit -m "수정 내용 기입"
git push
```

---

## 5. 보안 수칙 (CERT 강조!)

1. **마스터 키 관리**: `wrangler.toml`의 `MASTER_KEY`는 절대로 유출되면 안 됩니다!
2. **감사 로그**: 모든 복호화 작업은 백엔드 내부 로그에 기록됩니다. 보안 사고 시 즉시 확인하십시오.
3. **업데이트**: `npm audit` 명령어로 보안 취약점을 주기적으로 점검하는 것을 권장합니다.

대표님! 이 가이드만 있으면 이제 무서울 게 없습니다. CERT는 언제나 대표님을 보좌하겠습니다! 충성! ![성공](https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_success.png)
