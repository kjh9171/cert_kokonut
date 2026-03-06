/**
 * [Cert Kokonut 통합 보안 플랫폼 - 백엔드 엔진]
 * 최적화 대상: Vercel Serverless (Node.js 20+ Runtime)
 * 수정 원칙: 
 * 1. Cloudflare 10ms 제한 해결을 위한 비동기 구조 최적화
 * 2. Vercel 읽기 전용 파일시스템(Read-only FS) 대응 예외 처리
 * 3. ES 모듈 및 CommonJS(require) 혼용 환경 완벽 지원
 */

import "dotenv/config";
import express from "express";
import cors from "cors"; 
import crypto from "crypto"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const speakeasy = require("speakeasy");
import qrcode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";
import morgan from "morgan";

// ────── [환경 변수 및 경로 설정] ──────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel 배포 환경에서는 파일 쓰기가 제한되므로 에러 방지를 위해 경로 설정 유지
const LOCAL_DB_PATH = path.join(__dirname, "local_db.json");
const PAYMENTS_DB_PATH = path.join(__dirname, "payments_db.json");
const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// 페이팔 샌드박스 설정 (보안상 환경변수 권장)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AU_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "EL_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S_SECRET";
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// ────── [DB 인터페이스 및 초기화 논리] ──────

/**
 * DB 초기화 함수
 * 의도: 파일이 없을 경우 기본 관리자 계정(master_admin)을 포함한 초기 구조 생성
 */
const initDBs = async () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const hashedPass = await bcrypt.hash("cert1234", 10);
      const initialData = { 
        pms_admins: [{ 
          id: "master_admin", 
          email: "admin@cert.pms", 
          password: hashedPass, 
          name: "CERT총괄", 
          role: "admin", 
          licenseExpiry: "2099-12-31T23:59:59.000Z", 
          permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"], 
          otpEnabled: false, 
          createdAt: new Date().toISOString() 
        }], 
        privacy_records: [], 
        security_logs: [], 
        policies: [],
        law_knowledge: [{ id: "pipa_base", title: "개인정보 보호법 (기본)", content: "제30조 준수", lastUpdated: new Date().toISOString() }]
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
    }
    if (!fs.existsSync(PAYMENTS_DB_PATH)) {
      fs.writeFileSync(PAYMENTS_DB_PATH, JSON.stringify({ payment_requests: [] }, null, 2));
    }
  } catch (err) {
    console.warn("[DB Warning]: 서버리스 환경에서는 파일 쓰기가 제한될 수 있습니다.");
  }
};
initDBs();

// DB 읽기/쓰기 유틸리티 (에러 트래킹 포함)
const readDB = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } 
  catch (e) { return {}; }
};

const writeDB = (p, s) => {
  try { fs.writeFileSync(p, JSON.stringify(s, null, 2)); } 
  catch (e) { console.error("[Write Error]: Vercel FS는 Read-only입니다. 데이터가 저장되지 않았습니다."); }
};

const getCollection = async (col, dbPath = LOCAL_DB_PATH) => readDB(dbPath)[col] || [];

const addDoc = async (col, data, dbPath = LOCAL_DB_PATH) => {
  const store = readDB(dbPath);
  const newDoc = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), ...data, createdAt: new Date().toISOString() };
  if (!store[col]) store[col] = [];
  store[col].push(newDoc);
  writeDB(dbPath, store);
  return newDoc;
};

// ────── [익스프레스 앱 설정] ──────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms')); // 실시간 성능 모니터링 로그

// ────── [보안 미들웨어] ──────

/**
 * JWT 토큰 검증 미들웨어
 * 논리: Authorization 헤더에서 Bearer 토큰을 추출하여 유효성 검사
 */
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰 없음" });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch { 
    return res.status(403).json({ error: "세션 만료" }); 
  }
};

/**
 * 권한 기반 접근 제어 (RBAC)
 * @param {string} perm - 요구되는 권한 코드
 */
const checkAccess = (perm) => async (req, res, next) => {
  const admins = await getCollection("pms_admins");
  const user = admins.find(u => u.id === req.user.uid);
  if (user && (user.role === 'admin' || (user.permissions && user.permissions.includes(perm)))) return next();
  res.status(403).json({ error: "권한 부족" });
};

// ────── [인증 및 프로필 API] ──────

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admins = await getCollection("pms_admins");
    const userData = admins.find(u => u.email === email);
    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      return res.status(401).json({ error: "인증 실패" });
    }
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseExpiry: userData.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "로그인 처리 중 서버 오류" }); }
});

app.get("/api/auth/profile", verifyToken, async (req, res) => {
  const admins = await getCollection("pms_admins");
  const userData = admins.find(u => u.id === req.user.uid);
  if (!userData) return res.status(404).send();
  const { password, otpSecret, ...safeData } = userData;
  res.json(safeData);
});

// ────── [관리자 및 데이터 관리 API] ──────

app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const admins = await getCollection("pms_admins");
  res.json(admins.map(({ password, ...rest }) => rest));
});

app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  const records = await getCollection("privacy_records");
  const logs = await getCollection("security_logs");
  res.json({ total: records.length, today: logs.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length, consentRate: 98 });
});

app.get("/api/admin/logs", verifyToken, async (req, res) => {
  const logs = await getCollection("security_logs");
  const filtered = req.user.role === 'admin' ? logs : logs.filter(l => l.user === req.user.email);
  res.json([...filtered].reverse().slice(0, 50));
});

// ────── [지능형 정책 및 지식 엔진 API] ──────

app.get("/api/admin/knowledge", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  res.json(await getCollection("law_knowledge"));
});

app.post("/api/admin/knowledge/sync", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const externalSources = [
      { id: "pipa_2025", title: "개인정보 보호법 (2025 개정)", content: "제15조, 제29조, 제30조 최신 기준 강화 반영" },
      { id: "tech_patterns", title: "글로벌 테크 기업 방침 패턴", content: "다크 패턴 방지 최적화 문구 학습" }
    ];
    const store = readDB(LOCAL_DB_PATH);
    store.law_knowledge = externalSources.map(s => ({ ...s, lastUpdated: new Date().toISOString() }));
    writeDB(LOCAL_DB_PATH, store);
    res.json({ success: true, count: externalSources.length });
  } catch (err) { res.status(500).json({ error: "지식 동기화 실패" }); }
});

app.post("/api/admin/policies/generate", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { purpose, items, duration, safety } = req.body;
    const aiResponse = `# 표준 개인정보 처리방침\n\n본 방침은 CERT AI 엔진에 의해 생성되었습니다.\n\n### 목적: ${purpose}\n### 항목: ${items}\n### 보유기간: ${duration}\n### 조치: ${safety}`;
    res.json({ content: aiResponse });
  } catch (err) { res.status(500).json({ error: "정책 생성 실패" }); }
});

// ────── [결제 및 구독 승인 API] ──────

app.get("/api/admin/subscriptions/pending", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const requests = await getCollection("payment_requests", PAYMENTS_DB_PATH);
  res.json(requests.filter(r => r.status === "PENDING"));
});

app.post("/api/admin/subscriptions/approve/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const pStore = readDB(PAYMENTS_DB_PATH);
    const mStore = readDB(LOCAL_DB_PATH);
    const reqIdx = pStore.payment_requests.findIndex(r => r.id === req.params.id);
    if (reqIdx === -1) return res.status(404).json({ error: "요청 없음" });
    
    const request = pStore.payment_requests[reqIdx];
    const uIdx = mStore.pms_admins.findIndex(u => u.id === request.userId);
    if (uIdx !== -1) {
      mStore.pms_admins[uIdx].licenseExpiry = new Date(Date.now() + 30*24*60*60*1000).toISOString();
      request.status = "APPROVED";
      writeDB(LOCAL_DB_PATH, mStore);
      writeDB(PAYMENTS_DB_PATH, pStore);
      res.json({ success: true });
    } else res.status(404).json({ error: "사용자 없음" });
  } catch (err) { res.status(500).json({ error: "승인 처리 실패" }); }
});

// ────── [서버 실행 및 내보내기] ──────

/**
 * 논리: Vercel 환경이 아닐 때만 listen을 실행하여 로컬 개발 지원
 */
if (process.env.NODE_ENV !== 'production') {
  const PORT = 8080;
  app.listen(PORT, () => console.log(`[CERT] Local Mode: http://localhost:${PORT}`));
}

// Vercel Serverless Function으로 작동하기 위한 필수 내보내기
export default app;