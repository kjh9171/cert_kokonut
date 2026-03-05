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
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ pms_admins: [], privacy_records: [], pms_users: [], security_logs: [], verification_codes: [] }, null, 2));
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

// ────── 보안 미들웨어 ──────
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰이 없습니다." });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch { return res.status(403).json({ error: "세션이 만료되었습니다. 다시 로그인해 주세요." }); }
};

const checkAccess = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await getDocByAny(req.user.uid);
      if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
      if (user.role === 'admin') return next();
      const now = new Date();
      if (!user.licenseExpiry || new Date(user.licenseExpiry) < now) return res.status(402).json({ error: "라이선스 만료", code: "LICENSE_EXPIRED" });
      if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) return res.status(403).json({ error: "권한 없음" });
      next();
    } catch { res.status(500).json({ error: "보안 검증 오류" }); }
  };
};

// ────── 인증 및 가입 API ──────

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입된 이메일입니다." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiry = new Date(); expiry.setFullYear(expiry.getFullYear() + 10);
    const userData = { email, password: hashedPassword, name, role: "admin", licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), permissions: ['dashboard', 'member_db', 'user_manage', 'security_vault', 'policy_manage', 'my_settings'], otpEnabled: false, otpSecret: '' };
    const newDoc = await addDoc("pms_admins", userData);
    const token = jwt.sign({ uid: newDoc.id, email, role: "admin", name }, JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ success: true, token, user: { email, name, role: "admin", licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, permissions: userData.permissions, otpEnabled: false } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData || !(await bcrypt.compare(password, userData.password))) return res.status(401).json({ error: "인증 정보가 일치하지 않습니다." });

    // ✅ OTP가 활성화된 경우, 임시 토큰과 함께 OTP 요구 응답 반환
    if (userData.otpEnabled) {
      const tempToken = jwt.sign({ uid: userData.id, email: userData.email, isPendingOTP: true }, JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, requiresOTP: true, tempToken });
    }

    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: userData.otpEnabled } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ OTP 검증 로그인
app.post("/api/auth/login/otp", async (req, res) => {
  try {
    const { tempToken, otpCode } = req.body;
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (!decoded.isPendingOTP) return res.status(403).json({ error: "잘못된 접근입니다." });

    const userData = await getDocByAny(decoded.uid);
    const verified = speakeasy.totp.verify({ secret: userData.otpSecret, encoding: 'base32', token: otpCode });
    if (!verified) return res.status(401).json({ error: "OTP 코드가 일치하지 않습니다." });

    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: true } });
  } catch { res.status(403).json({ error: "인증 세션 만료" }); }
});

// ✅ OTP 설정 생성
app.get("/api/auth/otp/setup", verifyToken, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `PMS-Center:${req.user.email}` });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    // 임시 저장 (확정 전)
    await updateDoc("pms_admins", req.user.uid, { tempOtpSecret: secret.base32 });
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch { res.status(500).json({ error: "OTP 설정 중 오류" }); }
});

// ✅ OTP 활성화 확정
app.post("/api/auth/otp/enable", verifyToken, async (req, res) => {
  try {
    const { otpCode } = req.body;
    const user = await getDocByAny(req.user.uid);
    const verified = speakeasy.totp.verify({ secret: user.tempOtpSecret, encoding: 'base32', token: otpCode });
    if (!verified) return res.status(400).json({ error: "인증 코드가 일치하지 않습니다." });
    await updateDoc("pms_admins", req.user.uid, { otpSecret: user.tempOtpSecret, otpEnabled: true, tempOtpSecret: '' });
    res.json({ success: true, message: "2단계 인증이 활성화되었습니다." });
  } catch { res.status(500).json({ error: "OTP 활성화 오류" }); }
});

// ✅ OTP 비활성화
app.post("/api/auth/otp/disable", verifyToken, async (req, res) => {
  try {
    await updateDoc("pms_admins", req.user.uid, { otpEnabled: false, otpSecret: '' });
    res.json({ success: true, message: "2단계 인증이 해제되었습니다." });
  } catch { res.status(500).json({ error: "OTP 해제 오류" }); }
});

// ────── 이용자 및 데이터 API (기존 로직 유지) ──────
app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try { res.json((await getCollection("pms_admins")).map(({ password, otpSecret, ...rest }) => rest)); } catch { res.status(500).send(); }
});
app.post("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const { email, password, name, role, permissions, licenseExpiry } = req.body;
    const expiry = licenseExpiry ? new Date(licenseExpiry) : new Date(); if (!licenseExpiry) expiry.setDate(expiry.getDate() + 30);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoc = await addDoc("pms_admins", { email, password: hashedPassword, name, role: role || 'user', licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), permissions: permissions || ['dashboard'], otpEnabled: false });
    res.status(201).json({ success: true, id: newDoc.id });
  } catch { res.status(500).send(); }
});
app.put("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.uid !== req.params.id) return res.status(403).send();
    const { name, role, permissions, password, licenseExpiry } = req.body;
    const updateData = { name };
    if (req.user.role === 'admin') { if (role) updateData.role = role; if (permissions) updateData.permissions = permissions; if (licenseExpiry) updateData.licenseExpiry = licenseExpiry; }
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await updateDoc("pms_admins", req.params.id, updateData);
    res.json({ success: true });
  } catch { res.status(500).send(); }
});
app.delete("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try { await deleteDoc("pms_admins", req.params.id); res.json({ success: true }); } catch { res.status(500).send(); }
});
app.get("/api/admin/db/stats", verifyToken, async (req, res) => { res.json({ total: (await getCollection("privacy_records")).length, today: 0, consentRate: 100 }); });
app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => { res.json(await getCollection("privacy_records")); });
app.post("/api/admin/records/batch", verifyToken, checkAccess("security_vault"), async (req, res) => {
  try {
    const { records } = req.body; const store = readDB();
    const newRecords = records.map(r => ({ id: (Date.now() + Math.random()).toString(), ...r, createdAt: new Date().toISOString() }));
    store.privacy_records.push(...newRecords); writeDB(store);
    res.json({ success: true, count: newRecords.length });
  } catch { res.status(500).send(); }
});
app.get("/api/admin/logs", verifyToken, async (req, res) => { res.json((await getCollection("security_logs")).reverse().slice(0, 20)); });
app.post("/api/admin/logs", verifyToken, async (req, res) => {
  await addDoc("security_logs", { user: req.user.email, userName: req.user.name, action: req.body.action, target: req.body.target, reason: req.body.reason });
  res.json({ success: true });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`[CERT] PMS Backend running on port ${PORT}`));
