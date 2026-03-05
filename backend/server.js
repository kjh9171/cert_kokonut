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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────── DB 경로 설정 (물리적 분리) ──────
const LOCAL_DB_PATH = path.join(__dirname, "local_db.json");
const PAYMENTS_DB_PATH = path.join(__dirname, "payments_db.json");

// ────── 페이팔 설정 (보안 강화 및 디버깅) ──────
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AU_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "EL_DlvqR0XmC9Yn7Mv8P0w2Xy_Z-Y1J9K7L6M5N4O3P2Q1R0S_SECRET";
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

if (process.env.PAYPAL_CLIENT_ID === undefined) {
  console.warn("[CERT WARNING] 실제 PAYPAL_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인하십시오.");
}

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
    console.error("[CERT PAYPAL ERROR] 액세스 토큰 획득 실패:", err.message);
    throw err;
  }
};

// ────── DB 초기화 및 인터페이스 ──────
const initDBs = async () => {
  // 메인 DB 초기화
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const hashedPass = await bcrypt.hash("cert1234", 10);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ pms_admins: [{ id: "master_admin", email: "admin@cert.pms", password: hashedPass, name: "CERT총괄", role: "admin", licenseExpiry: "2099-12-31T23:59:59.000Z", permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"], otpEnabled: false, createdAt: new Date().toISOString() }], privacy_records: [], security_logs: [], policies: [] }, null, 2));
  }
  // 결제 전용 DB 초기화
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

const updateDoc = async (col, id, data, dbPath = LOCAL_DB_PATH) => {
  const store = readDB(dbPath);
  const idx = (store[col] || []).findIndex((i) => i.id === id);
  if (idx !== -1) { store[col][idx] = { ...store[col][idx], ...data }; writeDB(dbPath, store); }
};

const findUserByEmail = async (email) => (readDB(LOCAL_DB_PATH).pms_admins || []).find((u) => u.email === email) || null;
const getUserById = async (id) => (readDB(LOCAL_DB_PATH).pms_admins || []).find((i) => i.id === id) || null;

const logAction = async (uid, email, name, action, target, reason = "정기 모니터링") => {
  try { await addDoc("security_logs", { userId: uid, user: email, userName: name, action, target, reason }); } catch (e) { }
};

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// ────── 보안 미들웨어 ──────
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰이 없습니다." });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(403).json({ error: "세션 만료" }); }
};

const checkAccess = (perm) => async (req, res, next) => {
  const user = await getUserById(req.user.uid);
  if (user && (user.role === 'admin' || (user.permissions && user.permissions.includes(perm)))) return next();
  res.status(403).json({ error: "권한 없음" });
};

// ────── 인증 API ──────
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

// ────── 이용자 관리 API (관리자 전용) ──────
app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  res.json((await getCollection("pms_admins")).map(({ password, ...rest }) => rest));
});

// ────── 데이터 API ──────
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

// ────── 페이팔 결제 API ──────

app.post("/api/paypal/create-order", verifyToken, async (req, res) => {
  try {
    const { planName, amount } = req.body;
    console.log(`[CERT] 결제 요청: ${planName} ($${amount})`);
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ description: `${planName} 구독`, amount: { currency_code: "USD", value: amount.toString() } }] }),
    });
    const data = await response.json();
    if (!response.ok) { console.error("[CERT PAYPAL ERROR] 주문 생성 실패:", data); return res.status(400).json(data); }
    res.json(data);
  } catch (err) { res.status(500).json({ error: "결제 엔진 오류" }); }
});

app.post("/api/paypal/capture-order", verifyToken, async (req, res) => {
  try {
    const { orderID, planName } = req.body;
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (data.status === "COMPLETED") {
      // ✅ [결제 전용 DB 보관] 영구 결제 데이터 저장
      await addDoc("payment_requests", {
        userId: req.user.uid, userEmail: req.user.email, userName: req.user.name,
        orderID, planName, status: "PENDING", amount: data.purchase_units[0].payments.captures[0].amount.value
      }, PAYMENTS_DB_PATH);
      await logAction(req.user.uid, req.user.email, req.user.name, "PAYMENT_REQUEST_SUBMITTED", "PAYPAL_ENGINE", `구독 승인 요청: ${planName}`);
      return res.json({ success: true });
    }
    res.status(400).json({ error: "결제 미완료" });
  } catch (err) { res.status(500).json({ error: "캡처 오류" }); }
});

// ────── 구독 승인 관리 (관리자 전용) ──────

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
      const currentExpiry = user.licenseExpiry ? new Date(user.licenseExpiry) : new Date();
      user.licenseExpiry = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      user.permissions = ["dashboard", "member_db", "security_vault", "policy_manage", "subscription", "my_settings"];
      
      request.status = "APPROVED";
      request.approvedAt = new Date().toISOString();
      
      writeDB(LOCAL_DB_PATH, mainStore);
      writeDB(PAYMENTS_DB_PATH, paymentsStore);
      
      await logAction(req.user.uid, req.user.email, req.user.name, "SUBSCRIPTION_APPROVED", "ADMIN_ENGINE", `승인 완료: ${request.userEmail}`);
      res.json({ success: true });
    } else { res.status(404).json({ error: "사용자 없음" }); }
  } catch (err) { res.status(500).json({ error: "승인 처리 실패" }); }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`[CERT] PMS Backend running on port ${PORT}`));
