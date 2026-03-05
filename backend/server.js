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

// ────── DB 인터페이스 및 헬퍼 함수 ──────
const readDB = () => JSON.parse(fs.readFileSync(LOCAL_DB_PATH));
const writeDB = (store) => fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2));

const getCollection = async (col) => readDB()[col] || [];

const addDoc = async (col, data) => {
  const store = readDB();
  if (!store[col]) store[col] = [];
  const newDoc = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
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

const findUserByEmail = async (email) => {
  const store = readDB();
  // 관리자/사용자 통합 테이블(pms_admins)에서 검색
  return (store.pms_admins || []).find((u) => u.email === email) || null;
};

const getDocByAny = async (id) => {
  const store = readDB();
  return (store.pms_admins || []).find((i) => i.id === id) || null;
};

// ────── 보안 미들웨어 ──────
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰이 없습니다." });
  try { 
    req.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch { return res.status(403).json({ error: "유효하지 않은 토큰입니다." }); }
};

// ────── 보안 유틸리티 ──────
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", normalizeKey(ENCRYPTION_KEY_RAW), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  try {
    const [ivHex, encHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", normalizeKey(ENCRYPTION_KEY_RAW), iv);
    let dec = decipher.update(Buffer.from(encHex, "hex"));
    dec = Buffer.concat([dec, decipher.final()]);
    return dec.toString();
  } catch (err) { return null; }
}

// ────── 인증 및 가입 API ──────

app.post("/api/auth/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const store = readDB();
    store.verification_codes = (store.verification_codes || []).filter(c => c.email !== email);
    store.verification_codes.push({ email, code, expiresAt: Date.now() + 300000 });
    writeDB(store);
    console.log(`[CERT 보안알림] ${email} 인증 코드: [${code}]`);
    res.json({ success: true, message: "인증 코드가 발송되었습니다. (콘솔 확인)" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const store = readDB();
    const record = (store.verification_codes || []).find(c => c.email === email && c.code === code);
    if (!record || record.expiresAt < Date.now()) return res.status(400).json({ error: "코드가 일치하지 않거나 만료되었습니다." });
    record.verified = true;
    writeDB(store);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const store = readDB();
    const isVerified = (store.verification_codes || []).some(c => c.email === email && c.verified);
    if (!isVerified) return res.status(400).json({ error: "이메일 인증이 필요합니다." });
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입된 이메일입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { 
      email, 
      password: hashedPassword, 
      name, 
      role: "admin", 
      permissions: ['dashboard', 'member_db', 'user_manage', 'security_vault', 'policy_manage', 'my_settings'],
      otpSecret: encrypt(speakeasy.generateSecret().base32), 
      otpEnabled: false 
    };
    const newDoc = await addDoc("pms_admins", userData);
    
    const token = jwt.sign({ uid: newDoc.id, email, role: "admin", name }, JWT_SECRET, { expiresIn: "8h" });
    res.status(201).json({ success: true, token, user: { email, name, role: "admin" } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData) return res.status(401).json({ error: "등록되지 않은 이메일입니다." });
    if (!(await bcrypt.compare(password, userData.password))) return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });

    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────── 이용자 관리 API (관리자 전용) ──────

app.get("/api/admin/admins", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "권한이 없습니다." });
    const admins = await getCollection("pms_admins");
    res.json(admins.map(({ password, otpSecret, ...rest }) => rest));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/admins", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "관리자만 이용자를 추가할 수 있습니다." });
    const { email, password, name, role, permissions } = req.body;
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입된 이메일입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { email, password: hashedPassword, name, role: role || 'user', permissions: permissions || ['dashboard'] };
    const newDoc = await addDoc("pms_admins", userData);
    res.status(201).json({ success: true, id: newDoc.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    const isSelf = req.user.uid === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) return res.status(403).json({ error: "수정 권한이 없습니다." });

    const { name, role, permissions, password } = req.body;
    const updateData = { name };
    if (isAdmin) {
      if (role) updateData.role = role;
      if (permissions) updateData.permissions = permissions;
    }
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await updateDoc("pms_admins", req.params.id, updateData);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "권한이 없습니다." });
    await deleteDoc("pms_admins", req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────── 데이터 및 통계 API ──────

app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  try {
    const records = await getCollection("privacy_records");
    res.json({ total: records.length, today: 0, consentRate: 100 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/admin/records", verifyToken, async (req, res) => {
  try {
    const records = await getCollection("privacy_records");
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/records/batch", verifyToken, async (req, res) => {
  try {
    const { records } = req.body;
    const store = readDB();
    const newRecords = records.map(r => ({ id: (Date.now() + Math.random()).toString(), ...r, createdAt: new Date().toISOString() }));
    store.privacy_records.push(...newRecords);
    writeDB(store);
    res.json({ success: true, count: newRecords.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/logs", verifyToken, async (req, res) => {
  try {
    const { action, target, reason } = req.body;
    await addDoc("security_logs", { user: req.user.email, userName: req.user.name, action, target, reason });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/admin/logs", verifyToken, async (req, res) => {
  try {
    const logs = await getCollection("security_logs");
    res.json([...logs].reverse().slice(0, 20));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`[CERT] PMS Backend running on port ${PORT}`));
