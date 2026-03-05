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
  return (store.pms_admins || []).find((u) => u.email === email) || null;
};

const getDocByAny = async (id) => {
  const store = readDB();
  return (store.pms_admins || []).find((i) => i.id === id) || null;
};

// 라이선스 키 생성기
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
  } catch { return res.status(403).json({ error: "유효하지 않은 토큰입니다." }); }
};

// ✅ [추가] 라이선스 및 권한 검증 미들웨어
const checkAccess = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await getDocByAny(req.user.uid);
      if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

      // 1. 라이선스 만료 체크
      const now = new Date();
      if (new Date(user.licenseExpiry) < now) {
        return res.status(402).json({ 
          error: "라이선스 만료", 
          code: "LICENSE_EXPIRED",
          message: "계속 이용하시려면 구독 서비스를 이용해 주십시오." 
        });
      }

      // 2. 개별 메뉴 권한 체크
      if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) {
        return res.status(403).json({ 
          error: "권한 없음", 
          code: "PERMISSION_DENIED",
          message: "해당 기능을 이용할 권한이 없습니다. 관리자에게 문의하십시오." 
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "보안 검증 중 오류 발생" });
    }
  };
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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입된 이메일입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 365);

    const userData = { 
      email, 
      password: hashedPassword, 
      name, 
      role: "admin", 
      licenseKey: generateLicenseKey(),
      licenseExpiry: expiry.toISOString(),
      permissions: ['dashboard', 'member_db', 'user_manage', 'security_vault', 'policy_manage', 'my_settings'],
      otpSecret: encrypt(speakeasy.generateSecret().base32), 
      otpEnabled: false 
    };
    const newDoc = await addDoc("pms_admins", userData);
    
    const token = jwt.sign({ uid: newDoc.id, email, role: "admin", name }, JWT_SECRET, { expiresIn: "8h" });
    res.status(201).json({ success: true, token, user: { email, name, role: "admin", licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData) return res.status(401).json({ error: "가입되지 않은 이메일입니다." });
    if (!(await bcrypt.compare(password, userData.password))) return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });

    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ 
      success: true, 
      token, 
      user: { 
        email: userData.email, 
        name: userData.name, 
        role: userData.role, 
        permissions: userData.permissions,
        licenseKey: userData.licenseKey,
        licenseExpiry: userData.licenseExpiry 
      } 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await getDocByAny(req.user.uid);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ error: "현재 비밀번호가 일치하지 않습니다." });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateDoc("pms_admins", req.user.uid, { password: hashedPassword });
    res.json({ success: true, message: "비밀번호가 변경되었습니다." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────── 이용자 관리 API ──────

app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const admins = await getCollection("pms_admins");
    res.json(admins.map(({ password, otpSecret, ...rest }) => rest));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const { email, password, name, role, permissions } = req.body;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { email, password: hashedPassword, name, role: role || 'user', licenseKey: generateLicenseKey(), licenseExpiry: expiry.toISOString(), permissions: permissions || ['dashboard'] };
    const newDoc = await addDoc("pms_admins", userData);
    res.status(201).json({ success: true, id: newDoc.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    const isSelf = req.user.uid === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) return res.status(403).json({ error: "수정 권한이 없습니다." });

    const { name, role, permissions, password, licenseExpiry } = req.body;
    const updateData = { name };
    if (isAdmin) {
      if (role) updateData.role = role;
      if (permissions) updateData.permissions = permissions;
      if (licenseExpiry) updateData.licenseExpiry = licenseExpiry;
    }
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await updateDoc("pms_admins", req.params.id, updateData);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
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

app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => {
  try {
    const records = await getCollection("privacy_records");
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/records/batch", verifyToken, checkAccess("security_vault"), async (req, res) => {
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
