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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DB_PATH = path.join(__dirname, "local_db.json");
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ 
    pms_admins: [], 
    privacy_records: [], 
    security_logs: [], 
    policies: [] 
  }, null, 2));
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || "cert_total_manager_secure_key_256";
const IV_LENGTH = 16;
const normalizeKey = (k) => Buffer.from(k.padEnd(32, "0").slice(0, 32));

// ────── DB 인터페이스 ──────
const readDB = () => JSON.parse(fs.readFileSync(LOCAL_DB_PATH));
const writeDB = (store) => fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2));
const getCollection = async (col) => readDB()[col] || [];
const addDoc = async (col, data) => {
  const store = readDB();
  const newDoc = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
  if (!store[col]) store[col] = [];
  store[col].push(newDoc);
  writeDB(store);
  return newDoc;
};
const updateDoc = async (col, id, data) => {
  const store = readDB();
  const idx = (store[col] || []).findIndex((i) => i.id === id);
  if (idx !== -1) { store[col][idx] = { ...store[col][idx], ...data }; writeDB(store); }
};
const deleteDoc = async (col, id) => {
  const store = readDB();
  if (store[col]) { store[col] = store[col].filter((i) => i.id !== id); writeDB(store); }
};
const findUserByEmail = async (email) => (readDB().pms_admins || []).find((u) => u.email === email) || null;
const getDocByAny = async (id) => (readDB().pms_admins || []).find((i) => i.id === id) || null;

const generateLicenseKey = () => {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CERT-${part()}-${part()}-${part()}`;
};

// ✅ 전방위 로깅 시스템 함수
const logAction = async (uid, email, name, action, target, reason = "정기 모니터링") => {
  await addDoc("security_logs", { 
    userId: uid || 'SYSTEM', 
    user: email || 'system@cert.pms', 
    userName: name || '시스템에이전트', 
    action, 
    target, 
    reason 
  });
};

// ────── 보안 미들웨어 ──────
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰이 없습니다." });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch { return res.status(403).json({ error: "세션 만료" }); }
};

const checkAccess = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await getDocByAny(req.user.uid);
      if (!user) return res.status(404).json({ error: "사용자 없음" });
      
      if (user.role === 'admin') return next();
      
      const now = new Date();
      if (!user.licenseExpiry || new Date(user.licenseExpiry) < now) {
        await logAction(user.id, user.email, user.name, "ACCESS_DENIED", requiredPermission, "라이선스 만료로 인한 차단");
        return res.status(402).json({ error: "라이선스 만료", code: "LICENSE_EXPIRED" });
      }
      
      if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) {
        await logAction(user.id, user.email, user.name, "ACCESS_DENIED", requiredPermission, "권한 부족으로 인한 차단");
        return res.status(403).json({ error: "권한 없음" });
      }
      next();
    } catch { res.status(500).json({ error: "보안 오류" }); }
  };
};

// ────── 인증 API ──────

app.get("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const userData = await getDocByAny(req.user.uid);
    if (!userData) return res.status(404).send();
    const { password, otpSecret, tempOtpSecret, ...safeData } = userData;
    res.json(safeData);
  } catch { res.status(500).send(); }
});

app.get("/api/auth/refresh", verifyToken, async (req, res) => {
  try {
    const token = jwt.sign({ uid: req.user.uid, email: req.user.email, role: req.user.role, name: req.user.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(req.user.uid, req.user.email, req.user.name, "SESSION_REFRESH", "AUTH_ENGINE", "세션 연장 승인");
    res.json({ success: true, token });
  } catch { res.status(500).send(); }
});

app.post("/api/auth/google-mock", async (req, res) => {
  try {
    const { email } = req.body;
    let userData = await findUserByEmail(email);
    if (!userData) {
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
      userData = await addDoc("pms_admins", { 
        email, name: email.split('@')[0], role: "user", 
        licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), 
        permissions: ['dashboard'], otpEnabled: false, otpSecret: '' 
      });
      await logAction(userData.id, email, userData.name, "GOOGLE_REGISTER", "AUTH_ENGINE", "구글 계정 자동 가입");
    }

    if (userData.otpEnabled) {
      const tempToken = jwt.sign({ uid: userData.id, email: userData.email, isPendingOTP: true }, JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, requiresOTP: true, tempToken });
    }

    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(userData.id, email, userData.name, "LOGIN_SUCCESS", "GOOGLE_AUTH", "구글 로그인 성공");
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: userData.otpEnabled } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입됨" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiry = new Date(); expiry.setFullYear(expiry.getFullYear() + 10);
    const userData = { email, password: hashedPassword, name, role: "admin", licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), permissions: ['dashboard', 'member_db', 'user_manage', 'security_vault', 'policy_manage', 'my_settings', 'subscription'], otpEnabled: false, otpSecret: '' };
    const newDoc = await addDoc("pms_admins", userData);
    const token = jwt.sign({ uid: newDoc.id, email, role: "admin", name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(newDoc.id, email, name, "REGISTER_SUCCESS", "AUTH_ENGINE", "신규 보안 계정 생성");
    res.status(201).json({ success: true, token, user: { email, name, role: "admin", licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, permissions: userData.permissions, otpEnabled: false } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      await logAction(null, email, "UNKNOWN", "LOGIN_FAILED", "AUTH_ENGINE", "인증 실패");
      return res.status(401).json({ error: "정보 불일치" });
    }
    if (userData.otpEnabled) {
      const tempToken = jwt.sign({ uid: userData.id, email: userData.email, isPendingOTP: true }, JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, requiresOTP: true, tempToken });
    }
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(userData.id, email, userData.name, "LOGIN_SUCCESS", "AUTH_ENGINE", "보안 로그인 성공");
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: userData.otpEnabled } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/login/otp", async (req, res) => {
  try {
    const { tempToken, otpCode } = req.body;
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    const userData = await getDocByAny(decoded.uid);
    const verified = speakeasy.totp.verify({ secret: userData.otpSecret, encoding: 'base32', token: otpCode });
    if (!verified) {
      await logAction(userData.id, userData.email, userData.name, "OTP_FAILED", "2FA_ENGINE", "OTP 불일치");
      return res.status(401).json({ error: "OTP 불일치" });
    }
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(userData.id, userData.email, userData.name, "LOGIN_SUCCESS_OTP", "2FA_ENGINE", "OTP 인증 성공");
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: true } });
  } catch { res.status(403).send(); }
});

// ────── 이용자 관리 API ──────
app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try { res.json((await getCollection("pms_admins")).map(({ password, otpSecret, ...rest }) => rest)); } catch { res.status(500).send(); }
});
app.post("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const { email, password, name, role, permissions, licenseExpiry } = req.body;
    const expiry = licenseExpiry ? new Date(licenseExpiry) : new Date(Date.now() + 30*24*60*60*1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoc = await addDoc("pms_admins", { email, password: hashedPassword, name, role: role || 'user', licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), permissions: permissions || ['dashboard'], otpEnabled: false });
    await logAction(req.user.uid, req.user.email, req.user.name, "USER_CREATED", `USER:${email}`, "신규 이용자 수동 등록");
    res.status(201).json({ success: true, id: newDoc.id });
  } catch { res.status(500).send(); }
});
app.put("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.uid !== req.params.id) return res.status(403).send();
    const { name, role, permissions, password, licenseExpiry } = req.body;
    const updateData = { name };
    if (req.user.role === 'admin') { 
      if (role) updateData.role = role; 
      if (permissions) updateData.permissions = permissions; 
      if (licenseExpiry) updateData.licenseExpiry = licenseExpiry; 
    }
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await updateDoc("pms_admins", req.params.id, updateData);
    await logAction(req.user.uid, req.user.email, req.user.name, "USER_UPDATED", `UID:${req.params.id}`, "이용자 권한/정보 수정");
    res.json({ success: true });
  } catch { res.status(500).send(); }
});
app.delete("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try { 
    await deleteDoc("pms_admins", req.params.id); 
    await logAction(req.user.uid, req.user.email, req.user.name, "USER_DELETED", `UID:${req.params.id}`, "이용자 계정 영구 파기");
    res.json({ success: true }); 
  } catch { res.status(500).send(); }
});

// ────── 데이터 자산 API ──────
app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => { 
  await logAction(req.user.uid, req.user.email, req.user.name, "DATA_ACCESS", "PRIVACY_RECORDS", "회원 DB 리스트 열람");
  res.json(await getCollection("privacy_records")); 
});
app.delete("/api/admin/records/:id", verifyToken, checkAccess("member_db"), async (req, res) => {
  try {
    await deleteDoc("privacy_records", req.params.id);
    await logAction(req.user.uid, req.user.email, req.user.name, "DATA_DELETED", `REC_ID:${req.params.id}`, "개인정보 자산 개별 파기");
    res.json({ success: true });
  } catch { res.status(500).send(); }
});
app.post("/api/admin/records/batch", verifyToken, checkAccess("security_vault"), async (req, res) => {
  try {
    const { records } = req.body; const store = readDB();
    const newRecords = records.map(r => ({ id: (Date.now() + Math.random()).toString(), ...r, createdAt: new Date().toISOString() }));
    store.privacy_records.push(...newRecords); writeDB(store);
    await logAction(req.user.uid, req.user.email, req.user.name, "DATA_UPLOAD", "PRIVACY_RECORDS", `${newRecords.length}건 데이터 일괄 등록`);
    res.json({ success: true, count: newRecords.length });
  } catch { res.status(500).send(); }
});

// ────── 정책 및 감사 API ──────
app.get("/api/admin/policies", verifyToken, async (req, res) => {
  const policies = await getCollection("policies");
  res.json(policies.reverse()[0] || { content: "" });
});
app.post("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const newPolicy = await addDoc("policies", { content: req.body.content, editor: req.user.name });
    await logAction(req.user.uid, req.user.email, req.user.name, "POLICY_UPDATED", "PRIVACY_POLICY", "개인정보 처리방침 신규 게시");
    res.json({ success: true, policy: newPolicy });
  } catch { res.status(500).send(); }
});
app.get("/api/admin/logs", verifyToken, async (req, res) => {
  try {
    const logs = await getCollection("security_logs");
    const filtered = req.user.role === 'admin' ? logs : logs.filter(l => l.user === req.user.email);
    res.json([...filtered].reverse().slice(0, 50));
  } catch { res.status(500).send(); }
});
app.post("/api/admin/logs", verifyToken, async (req, res) => {
  await logAction(req.user.uid, req.user.email, req.user.name, req.body.action, req.body.target, req.body.reason);
  res.json({ success: true });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`[CERT] PMS Backend running on port ${PORT}`));
