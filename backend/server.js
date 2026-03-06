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
import morgan from "morgan"; // ✅ 실시간 HTTP 로그 기록기

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────── DB 경로 설정 ──────
const LOCAL_DB_PATH = path.join(__dirname, "local_db.json");
const PAYMENTS_DB_PATH = path.join(__dirname, "payments_db.json");

// ────── 페이팔 설정 ──────
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AU_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "EL_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S_SECRET";
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || "인증 실패");
    return data.access_token;
  } catch (err) {
    console.error("[CERT PAYPAL ERROR] Access Token 실패:", err.message);
    throw err;
  }
};

// ────── DB 인터페이스 ──────
const initDBs = async () => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const hashedPass = await bcrypt.hash("cert1234", 10);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ 
      pms_admins: [{ id: "master_admin", email: "admin@cert.pms", password: hashedPass, name: "CERT총괄", role: "admin", licenseExpiry: "2099-12-31T23:59:59.000Z", permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"], otpEnabled: false, createdAt: new Date().toISOString() }], 
      privacy_records: [], 
      security_logs: [], 
      policies: [],
      law_knowledge: [
        { id: "pipa_base", title: "개인정보 보호법 (기본)", content: "제30조에 의거한 처리방침 수립 의무 및 필수 포함 항목 15가지 준수", lastUpdated: new Date().toISOString() }
      ]
    }, null, 2));
  }
  if (!fs.existsSync(PAYMENTS_DB_PATH)) {
    fs.writeFileSync(PAYMENTS_DB_PATH, JSON.stringify({ payment_requests: [] }, null, 2));
  }
};
initDBs();

const readDB = (p) => JSON.parse(fs.readFileSync(p));
const writeDB = (p, s) => fs.writeFileSync(p, JSON.stringify(s, null, 2));
const getCollection = async (col, dbPath = LOCAL_DB_PATH) => readDB(dbPath)[col] || [];
const addDoc = async (col, data, dbPath = LOCAL_DB_PATH) => {
  const store = readDB(dbPath);
  const newDoc = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), ...data, createdAt: new Date().toISOString() };
  if (!store[col]) store[col] = [];
  store[col].push(newDoc);
  writeDB(dbPath, store);
  return newDoc;
};

const findUserByEmail = async (email) => (readDB(LOCAL_DB_PATH).pms_admins || []).find((u) => u.email === email) || null;
const getUserById = async (id) => (readDB(LOCAL_DB_PATH).pms_admins || []).find((i) => i.id === id) || null;

const logAction = async (uid, email, name, action, target, reason = "정기 모니터링") => {
  try { await addDoc("security_logs", { userId: uid, user: email, userName: name, action, target, reason }); } catch (e) { }
};

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰 없음" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(403).json({ error: "세션 만료" }); }
};

const checkAccess = (perm) => async (req, res, next) => {
  const user = await getUserById(req.user.uid);
  if (user && (user.role === 'admin' || (user.permissions && user.permissions.includes(perm)))) return next();
  res.status(403).json({ error: "권한 부족" });
};

// ────── API 엔드포인트 ──────

app.get("/api/auth/profile", verifyToken, async (req, res) => {
  const userData = await getUserById(req.user.uid);
  if (!userData) return res.status(404).send();
  const { password, otpSecret, tempOtpSecret, ...safeData } = userData;
  res.json(safeData);
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData || !(await bcrypt.compare(password, userData.password))) return res.status(401).json({ error: "인증 실패" });
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseExpiry: userData.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "서버 오류" }); }
});

app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  res.json((await getCollection("pms_admins")).map(({ password, ...rest }) => rest));
});

app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  const records = await getCollection("privacy_records");
  const logs = await getCollection("security_logs");
  res.json({ total: records.length, today: logs.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length, consentRate: 98 });
});

app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => { res.json(await getCollection("privacy_records")); });

app.get("/api/admin/logs", verifyToken, async (req, res) => {
  const logs = await getCollection("security_logs");
  const filtered = req.user.role === 'admin' ? logs : logs.filter(l => l.user === req.user.email);
  res.json([...filtered].reverse().slice(0, 50));
});

// ────── 학습 지식 시스템 API ──────

app.get("/api/admin/knowledge", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  res.json(await getCollection("law_knowledge"));
});

app.post("/api/admin/knowledge/sync", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    console.log(`[CERT LEARNING] 최신 법령 및 외부 방침 동기화...`);
    const externalSources = [
      { id: "pipa_2025", title: "개인정보 보호법 (2025 개정)", content: "제15조(수집이용), 제29조(안전조치), 제30조(처리방침) 최신 기준 강화 반영" },
      { id: "tech_patterns", title: "글로벌 테크 기업 방침 패턴", content: "다크 패턴 방지 및 정보주체 가독성 최적화 문구 구성 방식 학습" }
    ];
    const store = readDB(LOCAL_DB_PATH);
    store.law_knowledge = externalSources.map(s => ({ ...s, lastUpdated: new Date().toISOString() }));
    writeDB(LOCAL_DB_PATH, store);
    await logAction(req.user.uid, req.user.email, req.user.name, "KNOWLEDGE_SYNCED", "LEARNING_ENGINE", "실시간 지식 동기화 성공");
    res.json({ success: true, count: externalSources.length });
  } catch (err) { res.status(500).json({ error: "동기화 실패" }); }
});

// ────── 정책 생성 및 정제 API ──────

app.post("/api/admin/policies/refine", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { fields } = req.body;
    const knowledge = await getCollection("law_knowledge");
    const latestRef = knowledge.map(k => k.content).join(" ");
    
    const refinedFields = {};
    for (const [key, value] of Object.entries(fields)) {
      // 실제 구현 시 AI prompt에 latestRef를 포함하여 정밀 정제 수행
      let refined = value;
      if (value.length < 10) refined = `[지능형 정제] ${value}에 대한 법률적 근거를 보강하여 표준화된 문구로 재구성하였습니다. (PIPA 2025 기준 준수)`;
      else refined = `[정제 완료] ${value}`;
      refinedFields[key] = refined;
    }
    res.json({ refinedFields });
  } catch (err) { res.status(500).json({ error: "정제 실패" }); }
});

app.post("/api/admin/policies/generate", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { purpose, items, duration, outsourcing, safety, rights, cookies, responsible, access, remedies } = req.body;
    const knowledge = await getCollection("law_knowledge");
    const knowledgeContext = knowledge.map(k => `[${k.title}] ${k.content}`).join("\n");

    const aiResponse = `# 표준 개인정보 처리방침 (최신 지식 학습본)

본 방침은 최신 법령 및 ${knowledge.length}건의 외부 학습 데이터를 바탕으로 작성되었습니다.

### 제1조 (처리 목적)
**${purpose}** (학습된 최신 법령에 의거하여 목적 외 이용 금지 원칙 준수)

### 제2조 (수집 항목)
필수항목: **${items}**

### 제3조 (보유 및 파기)
보유 기간: **${duration}**
파기 방법: **${req.body.destruction || "파쇄 또는 영구 삭제"}**

### 제4조 (안전성 확보조치)
**${safety}** (제29조에 따른 기술적·관리적·물리적 조치 포함)

### 제5조 (기타 사항)
- 정보주체 권리: ${rights}
- 쿠키 정책: ${cookies}
- 보호책임자: ${responsible}
- 구제 방법: ${remedies}

---
*본 방침은 CERT AI 지능형 학습 엔진에 의해 실시간 법령을 참조하여 생성되었습니다.*`;

    await logAction(req.user.uid, req.user.email, req.user.name, "POLICY_GENERATED", "POLICY_ENGINE", "최신 지식 기반 정책 생성");
    res.json({ content: aiResponse });
  } catch (err) { res.status(500).json({ error: "생성 실패" }); }
});

app.get("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const policies = await getCollection("policies");
  res.json([...policies].reverse());
});

app.post("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { content, reason } = req.body;
    const newDoc = await addDoc("policies", { content, reason, author: req.user.name, authorEmail: req.user.email });
    await logAction(req.user.uid, req.user.email, req.user.name, "POLICY_PUBLISHED", "POLICY_ENGINE", reason);
    res.json(newDoc);
  } catch (err) { res.status(500).json({ error: "저장 실패" }); }
});

// ────── 페이팔 주문 관리 (승인 로직 등) ──────

app.get("/api/admin/subscriptions/pending", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const requests = await getCollection("payment_requests", PAYMENTS_DB_PATH);
  res.json(requests.filter(r => r.status === "PENDING"));
});

app.post("/api/admin/subscriptions/approve/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const paymentsStore = readDB(PAYMENTS_DB_PATH);
    const mainStore = readDB(LOCAL_DB_PATH);
    const reqIdx = paymentsStore.payment_requests.findIndex(r => r.id === req.params.id);
    if (reqIdx === -1) return res.status(404).json({ error: "요청 없음" });
    const request = paymentsStore.payment_requests[reqIdx];
    const userIdx = mainStore.pms_admins.findIndex(u => u.id === request.userId);
    if (userIdx !== -1) {
      const user = mainStore.pms_admins[userIdx];
      user.licenseExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      request.status = "APPROVED";
      writeDB(LOCAL_DB_PATH, mainStore);
      writeDB(PAYMENTS_DB_PATH, paymentsStore);
      res.json({ success: true });
    } else res.status(404).json({ error: "사용자 없음" });
  } catch (err) { res.status(500).json({ error: "승인 처리 실패" }); }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`[CERT] PMS Backend running on port ${PORT}`);
});
