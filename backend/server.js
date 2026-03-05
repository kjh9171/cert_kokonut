import express from "express";
import cors from "cors"; // [FIX-03]
import crypto from "crypto"; // Node.js 내장 (npm 패키지 아님)
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
  fs.writeFileSync(
    LOCAL_DB_PATH,
    JSON.stringify(
      {
        pms_admins: [],
        privacy_records: [],
        pms_users: [],
      },
      null,
      2,
    ),
  );
}

const app = express();

// ✅ [FIX-03] CORS 미들웨어 적용
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";
// ✅ [FIX] 키를 항상 32바이트로 정규화하는 헬퍼 사용
const ENCRYPTION_KEY_RAW =
  process.env.ENCRYPTION_KEY || "cert_total_manager_secure_key_256";
const IV_LENGTH = 16;
const normalizeKey = (k) => Buffer.from(k.padEnd(32, "0").slice(0, 32));

// ✅ [FIX-05] JWT 인증 미들웨어
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰이 없습니다." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
  }
};

// ────── DB 인터페이스 ──────
const readDB = () => JSON.parse(fs.readFileSync(LOCAL_DB_PATH));
const writeDB = (store) =>
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2));

const getCollection = async (col) => readDB()[col] || [];

// ✅ [FIX] DB 초기화 시 security_logs 추가
const initDB = () => {
  const store = readDB();
  let changed = false;
  ['pms_admins', 'privacy_records', 'pms_users', 'security_logs'].forEach(col => {
    if (!store[col]) { store[col] = []; changed = true; }
  });
  if (changed) writeDB(store);
};
initDB();

const getDoc = async (col, id) =>
  (readDB()[col] || []).find((i) => i.id === id) || null;

// ✅ [FIX-06] 두 컬렉션 모두 검색하는 헬퍼
const getDocByAny = async (id) => {
  const store = readDB();
  const admin = (store.pms_admins || []).find((i) => i.id === id);
  if (admin) return { ...admin, _col: "pms_admins" };
  const user = (store.pms_users || []).find((i) => i.id === id);
  if (user) return { ...user, _col: "pms_users" };
  return null;
};

const addDoc = async (col, data) => {
  const store = readDB();
  if (!store[col]) store[col] = [];
  const newDoc = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  store[col].push(newDoc);
  writeDB(store);
  return { id: newDoc.id };
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

const findUserByEmail = async (email) => {
  const store = readDB();
  const admin = (store.pms_admins || []).find((u) => u.email === email);
  if (admin) return { ...admin, _type: "ADMIN" };
  const user = (store.pms_users || []).find((u) => u.email === email);
  if (user) return { ...user, _type: "USER" };
  return null;
};

// ────── 보안 유틸리티 ──────
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    normalizeKey(ENCRYPTION_KEY_RAW),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  try {
    const [ivHex, encHex] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      normalizeKey(ENCRYPTION_KEY_RAW),
      iv,
    );
    let dec = decipher.update(Buffer.from(encHex, "hex"));
    dec = Buffer.concat([dec, decipher.final()]);
    return dec.toString();
  } catch (err) {
    console.error("[ERROR] 복호화 실패:", err.message);
    return null;
  }
}

// ────── 인증 API ──────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: "필수 정보 누락" });
    if (await findUserByEmail(email))
      return res.status(400).json({ error: "이미 등록된 이메일입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({ length: 20 });
    const role = email.includes("@cert.com") ? "admin" : "user";
    const userData = {
      email,
      password: hashedPassword,
      name,
      role,
      otpSecret: encrypt(secret.base32),
      otpEnabled: false,
    };
    const col = role === "admin" ? "pms_admins" : "pms_users";
    const docRef = await addDoc(col, userData);
    res
      .status(201)
      .json({
        success: true,
        id: docRef.id,
        message: "등록 완료! 로그인하세요.",
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await findUserByEmail(email);
    if (!userData)
      return res.status(401).json({ error: "등록되지 않은 이메일입니다." });
    if (!(await bcrypt.compare(password, userData.password)))
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    if (userData.otpEnabled)
      return res.json({ success: true, requireOTP: true, uid: userData.id });

    const token = jwt.sign(
      { uid: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({
      success: true,
      requireOTP: false,
      token,
      user: { email: userData.email, name: userData.name, role: userData.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/otp-setup", async (req, res) => {
  try {
    const { uid } = req.body;
    // ✅ [FIX-06] 두 컬렉션 모두 검색
    const userData = await getDocByAny(uid);
    if (!userData)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    const otpSecret = decrypt(userData.otpSecret);
    if (!otpSecret) return res.status(500).json({ error: "보안 키 복원 실패" });
    const otpUri = speakeasy.otpauthURL({
      secret: otpSecret,
      label: userData.email,
      issuer: "PMS_CERT",
      encoding: "base32",
    });
    res.json({ qrCodeUrl: await qrcode.toDataURL(otpUri) });
  } catch (err) {
    res.status(500).json({ error: "OTP 설정 중 오류" });
  }
});

app.post("/api/auth/otp-verify", async (req, res) => {
  try {
    const { uid, otpToken, activate } = req.body;
    // ✅ [FIX-06] 두 컬렉션 모두 검색
    const userData = await getDocByAny(uid);
    if (!userData)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    const otpSecret = decrypt(userData.otpSecret);
    if (!otpSecret) return res.status(500).json({ error: "보안 키 복원 실패" });
    const isValid = speakeasy.totp.verify({
      secret: otpSecret,
      encoding: "base32",
      token: otpToken,
      window: 1,
    });
    if (!isValid)
      return res.status(401).json({ error: "OTP 번호가 일치하지 않습니다." });
    if (activate !== undefined) {
      await updateDoc(userData._col, uid, { otpEnabled: activate });
      return res.json({
        success: true,
        message: `OTP ${activate ? "활성화" : "비활성화"} 완료`,
      });
    }
    const token = jwt.sign(
      { uid, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({
      success: true,
      token,
      user: { email: userData.email, name: userData.name, role: userData.role },
    });
  } catch (err) {
    res.status(500).json({ error: "OTP 검증 중 오류" });
  }
});

// ────── Admin API (모두 JWT 인증 적용) [FIX-05] ──────
app.get("/api/admin/admins", verifyToken, async (req, res) => {
  try {
    const admins = await getCollection("pms_admins");
    res.json(admins.map(({ password, otpSecret, ...rest }) => rest));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    await updateDoc("pms_admins", req.params.id, req.body.updateData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/admins/:id", verifyToken, async (req, res) => {
  try {
    await deleteDoc("pms_admins", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/users", verifyToken, async (req, res) => {
  try {
    const docRef = await addDoc("pms_users", req.body.userData);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/users/:id", verifyToken, async (req, res) => {
  try {
    await updateDoc("pms_users", req.params.id, req.body.userData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:id", verifyToken, async (req, res) => {
  try {
    await deleteDoc("pms_users", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 대시보드 통계 API
app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  try {
    const admins = await getCollection("pms_admins");
    const records = await getCollection("privacy_records");
    const todayStr = new Date().toISOString().split("T")[0];
    res.json({
      total: records.length,
      today: records.filter((r) => r.createdAt?.startsWith(todayStr)).length,
      consentRate:
        records.length > 0
          ? Math.round(
              (records.filter((r) => r.consent).length / records.length) * 100,
            )
          : 100,
      alerts: admins.filter((a) => !a.otpEnabled).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 개인정보 레코드 조회
app.get("/api/admin/records", verifyToken, async (req, res) => {
  try {
    const records = await getCollection("privacy_records");
    res.json(
      records.map((r) => ({
        ...r,
        email: r.email ? "***@***.***" : null,
        phone: r.phone
          ? (decrypt(r.phone) || "").replace(
              /(\d{3})-?(\d{4})-?(\d{4})/,
              "$1-****-$3",
            )
          : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 개인정보 레코드 등록
app.post("/api/admin/records", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, company, type } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "이름과 이메일은 필수입니다." });
    const newRecord = {
      name,
      email: encrypt(email),
      phone: phone ? encrypt(phone) : null,
      company: company || "미지정",
      type: type || "COMMON",
      consent: true,
      status: "ENCRYPTED",
    };
    // ✅ [FIX-04] addDoc 반환값 올바르게 사용
    const docRef = await addDoc("privacy_records", newRecord);
    res.json({ success: true, id: docRef.id, message: "보안 자산 등록 완료" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 개인정보 레코드 삭제
app.delete("/api/admin/records/:id", verifyToken, async (req, res) => {
  try {
    await deleteDoc("privacy_records", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ [추가] 개인정보 레코드 일괄 등록 (보안 금고 연동용)
app.post("/api/admin/records/batch", verifyToken, async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: "올바르지 않은 데이터 형식입니다." });
    
    const store = readDB();
    if (!store.privacy_records) store.privacy_records = [];
    
    const newRecords = records.map(r => ({
      id: (Date.now() + Math.random()).toString(),
      name: r.name || "미지정",
      email: r.email || "",
      phone: r.phone || "",
      status: r.status || "ENCRYPTED",
      createdAt: new Date().toISOString()
    }));
    
    store.privacy_records.push(...newRecords);
    writeDB(store);
    
    res.json({ success: true, count: newRecords.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 보안 감사 로그 기록
app.post("/api/admin/logs", verifyToken, async (req, res) => {
  try {
    const { action, target, reason, details } = req.body;
    const newLog = {
      user: req.user.email,
      userName: req.user.name || "관리자",
      action, // 'ENCRYPT' | 'DECRYPT'
      target, // 파일명 또는 데이터명
      reason, // 수행 사유
      details, // 처리 건수 등 상세 정보
    };
    await addDoc("security_logs", newLog);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 보안 감사 로그 조회
app.get("/api/admin/logs", verifyToken, async (req, res) => {
  try {
    const logs = await getCollection("security_logs");
    // 최신순으로 정렬하여 최근 20개만 반환
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 20);
    res.json(sortedLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`[CERT] PMS Backend running on port ${PORT}`),
);
