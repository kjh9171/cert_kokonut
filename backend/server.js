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

// ✅ [보안 개정] 도커 볼륨 매핑 위치(/app/local_db.json)와 소스 위치 대응
const LOCAL_DB_PATH = path.join(__dirname, "local_db.json");

// 초기 DB 구성 (마스터 관리자: admin@cert.pms / cert1234)
const initDB = async () => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const hashedPass = await bcrypt.hash("cert1234", 10);
    const initialData = { 
      pms_admins: [
        {
          id: "master_admin",
          email: "admin@cert.pms",
          password: hashedPass,
          name: "CERT총괄",
          role: "admin",
          licenseKey: "CERT-MASTER-ADMIN-KEY",
          licenseExpiry: "2099-12-31T23:59:59.000Z",
          permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"],
          otpEnabled: false,
          createdAt: new Date().toISOString()
        }
      ], 
      privacy_records: [], 
      security_logs: [], 
      policies: [] 
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
  }
};
initDB();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// ────── DB 인터페이스 (영속성 보장형) ──────
const readDB = () => JSON.parse(fs.readFileSync(LOCAL_DB_PATH));
const writeDB = (store) => fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2));

const getCollection = async (col) => readDB()[col] || [];

const addDoc = async (col, data) => {
  const store = readDB();
  const newDoc = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), ...data, createdAt: new Date().toISOString() };
  if (!store[col]) store[col] = [];
  store[col].push(newDoc);
  writeDB(store);
  return newDoc;
};

const updateDoc = async (col, id, data) => {
  const store = readDB();
  const idx = (store[col] || []).findIndex((i) => i.id === id);
  if (idx !== -1) { 
    store[col][idx] = { ...store[col][idx], ...data }; 
    writeDB(store); 
  }
};

const deleteDoc = async (col, id) => {
  const store = readDB();
  if (store[col]) { 
    store[col] = store[col].filter((i) => i.id !== id); 
    writeDB(store); 
  }
};

const findUserByEmail = async (email) => (readDB().pms_admins || []).find((u) => u.email === email) || null;
const getDocByAny = async (id) => (readDB().pms_admins || []).find((i) => i.id === id) || null;

const generateLicenseKey = () => {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CERT-${part()}-${part()}-${part()}`;
};

const logAction = async (uid, email, name, action, target, reason = "정기 모니터링") => {
  try {
    await addDoc("security_logs", { userId: uid, user: email, userName: name, action, target, reason });
  } catch (e) { }
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
      if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) {
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
    const userData = await getDocByAny(req.user.uid);
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch { res.status(500).send(); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (await findUserByEmail(email)) return res.status(400).json({ error: "이미 가입된 이메일입니다." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = (await getCollection("pms_admins")).length;
    const role = userCount === 0 ? "admin" : "user";
    const newUser = await addDoc("pms_admins", { 
      email, password: hashedPassword, name, role, 
      licenseKey: generateLicenseKey(), 
      licenseExpiry: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      permissions: ['dashboard', 'member_db', 'security_vault', 'policy_manage'],
      otpEnabled: false 
    });
    const token = jwt.sign({ uid: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(newUser.id, newUser.email, newUser.name, "USER_REGISTERED", "AUTH_ENGINE", "신규 회원 가입 성공");
    res.status(201).json({ success: true, token, user: { email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (err) { res.status(500).json({ error: "회원가입 엔진 오류" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      return res.status(401).json({ error: "인증 정보가 올바르지 않습니다." });
    }
    if (userData.otpEnabled) {
      const tempToken = jwt.sign({ uid: userData.id, email: userData.email, isPendingOTP: true }, JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, requiresOTP: true, tempToken });
    }
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(userData.id, email, userData.name, "LOGIN_SUCCESS", "AUTH_ENGINE", "보안 로그인 성공");
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: userData.otpEnabled } });
  } catch (err) { res.status(500).json({ error: "로그인 엔진 오류" }); }
});

// ✅ [개인화] 구글 로그인 시뮬레이션: 각 이메일별 독립 계정 생성
app.post("/api/auth/google-mock", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "구글 계정 이메일이 필요합니다." });
    
    let userData = await findUserByEmail(email);
    if (!userData) {
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);
      userData = await addDoc("pms_admins", { 
        email, 
        password: hashedPassword, 
        name: email.split('@')[0], 
        role: "user", 
        licenseKey: generateLicenseKey(), 
        licenseExpiry: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        permissions: ['dashboard', 'member_db', 'security_vault'],
        otpEnabled: false 
      });
      await logAction(userData.id, email, userData.name, "GOOGLE_SIGNUP", "AUTH_ENGINE", "구글 계정 자동 가입 및 연동");
    }
    
    if (userData.otpEnabled) {
      const tempToken = jwt.sign({ uid: userData.id, email: userData.email, isPendingOTP: true }, JWT_SECRET, { expiresIn: "5m" });
      return res.json({ success: true, requiresOTP: true, tempToken });
    }
    
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    await logAction(userData.id, email, userData.name, "GOOGLE_LOGIN_SUCCESS", "AUTH_ENGINE", "구글 계정 로그인 성공");
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: userData.otpEnabled } });
  } catch (err) { res.status(500).json({ error: "구글 인증 처리 엔진 오류" }); }
});

app.post("/api/auth/login/otp", async (req, res) => {
  try {
    const { tempToken, otpCode } = req.body;
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    const userData = await getDocByAny(decoded.uid);
    const verified = speakeasy.totp.verify({ secret: userData.otpSecret, encoding: 'base32', token: otpCode });
    if (!verified) return res.status(401).json({ error: "OTP 불일치" });
    const token = jwt.sign({ uid: userData.id, email: userData.email, role: userData.role, name: userData.name }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: userData.email, name: userData.name, role: userData.role, permissions: userData.permissions || [], licenseKey: userData.licenseKey, licenseExpiry: userData.licenseExpiry, otpEnabled: true } });
  } catch { res.status(403).send(); }
});

app.get("/api/auth/otp/setup", verifyToken, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `PMS_Center:${req.user.email}` });
    await updateDoc("pms_admins", req.user.uid, { tempOtpSecret: secret.base32 });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch { res.status(500).send(); }
});

app.post("/api/auth/otp/enable", verifyToken, async (req, res) => {
  try {
    const { otpCode } = req.body;
    const userData = await getDocByAny(req.user.uid);
    const verified = speakeasy.totp.verify({ secret: userData.tempOtpSecret, encoding: 'base32', token: otpCode });
    if (!verified) return res.status(400).json({ error: "코드가 틀립니다." });
    await updateDoc("pms_admins", req.user.uid, { otpEnabled: true, otpSecret: userData.tempOtpSecret, tempOtpSecret: null });
    res.json({ success: true });
  } catch { res.status(500).send(); }
});

app.post("/api/auth/otp/disable", verifyToken, async (req, res) => {
  try {
    await updateDoc("pms_admins", req.user.uid, { otpEnabled: false, otpSecret: null });
    res.json({ success: true });
  } catch { res.status(500).send(); }
});

app.put("/api/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await getDocByAny(req.user.uid);
    if (!await bcrypt.compare(currentPassword, user.password)) return res.status(400).json({ error: "현재 비밀번호 불일치" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateDoc("pms_admins", req.user.uid, { password: hashedPassword });
    res.json({ success: true, message: "비밀번호가 변경되었습니다." });
  } catch { res.status(500).send(); }
});

// ────── 이용자 관리 API (관리자 전용) ──────
app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  res.json((await getCollection("pms_admins")).map(({ password, otpSecret, ...rest }) => rest));
});

app.post("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const { email, password, name, role, permissions, licenseExpiry } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await addDoc("pms_admins", { 
    email, password: hashedPassword, name, role, permissions, 
    licenseExpiry, licenseKey: generateLicenseKey(), otpEnabled: false 
  });
  res.status(201).json({ success: true });
});

app.put("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const { name, role, permissions, licenseExpiry, password } = req.body;
  const updateData = { name, role, permissions, licenseExpiry };
  if (password) updateData.password = await bcrypt.hash(password, 10);
  await updateDoc("pms_admins", req.params.id, updateData);
  res.json({ success: true });
});

app.delete("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  await deleteDoc("pms_admins", req.params.id);
  res.json({ success: true });
});

// ────── 데이터 및 관제 API ──────
app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => { res.json(await getCollection("privacy_records")); });
app.delete("/api/admin/records/:id", verifyToken, checkAccess("member_db"), async (req, res) => {
  await deleteDoc("privacy_records", req.params.id); res.json({ success: true });
});
app.post("/api/admin/records/batch", verifyToken, checkAccess("security_vault"), async (req, res) => {
  const { records } = req.body; const store = readDB();
  const newRecords = records.map(r => ({ id: (Date.now() + Math.random()).toString().replace(".",""), ...r, createdAt: new Date().toISOString() }));
  store.privacy_records.push(...newRecords); writeDB(store);
  res.json({ success: true, count: newRecords.length });
});
app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  const records = await getCollection("privacy_records");
  const logs = await getCollection("security_logs");
  res.json({ total: records.length, today: logs.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length, consentRate: 98 });
});
app.get("/api/admin/policies", verifyToken, async (req, res) => {
  const policies = await getCollection("policies"); res.json(policies.reverse()[0] || { content: "" });
});
app.post("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  await addDoc("policies", { content: req.body.content, editor: req.user.name }); res.json({ success: true });
});
app.get("/api/admin/logs", verifyToken, async (req, res) => {
  const logs = await getCollection("security_logs");
  const filtered = req.user.role === 'admin' ? logs : logs.filter(l => l.user === req.user.email);
  res.json([...filtered].reverse().slice(0, 50));
});
app.post("/api/admin/logs", verifyToken, async (req, res) => {
  await logAction(req.user.uid, req.user.email, req.user.name, req.body.action, req.body.target, req.body.reason);
  res.json({ success: true });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`[CERT] PMS Backend running on port ${PORT}`));
