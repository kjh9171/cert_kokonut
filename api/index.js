/**
 * [Cert Kokonut 통합 보안 플랫폼 - 백엔드 엔진]
 * 최적화 대상: Vercel Serverless & MongoDB Atlas
 */

import "dotenv/config";
import express from "express";
import cors from "cors"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import morgan from "morgan";

// ────── [환경 변수 설정] ──────
// Vercel Settings -> Environment Variables에서 설정한 값을 읽어옵니다.
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// ────── [MongoDB 커넥션 캐싱 (Vercel 최적화)] ──────
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  if (!MONGODB_URI) {
    console.error("🚨 [CERT ERROR] MONGODB_URI 환경변수가 설정되지 않았습니다!");
    throw new Error("MONGODB_URI missing");
  }

  try {
    // 서버리스 환경에 최적화된 연결 옵션 적용
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5초 안에 연결 안되면 타임아웃
    });
    cachedDb = db;
    console.log("✅ [CERT] MongoDB 클라우드 금고 연결 성공!");
    return db;
  } catch (err) {
    console.error("❌ [CERT ERROR] 데이터베이스 연결 실패 사유:", err.message);
    throw err;
  }
}

// ────── [데이터 스키마 및 모델] ──────
const schemaOptions = { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true };

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "user" },
  licenseExpiry: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) },
  permissions: { type: [String], default: ["dashboard"] },
  otpEnabled: { type: Boolean, default: false }
}, schemaOptions);

const PrivacyRecordSchema = new mongoose.Schema({
  name: String, phone: String, email: String, status: { type: String, default: "ENCRYPTED" }
}, schemaOptions);

const SecurityLogSchema = new mongoose.Schema({
  userId: String, user: String, userName: String, action: String, target: String, reason: String
}, schemaOptions);

const PolicySchema = new mongoose.Schema({
  content: String, reason: String, author: String, authorEmail: String
}, schemaOptions);

const LawKnowledgeSchema = new mongoose.Schema({
  knowledgeId: { type: String, unique: true }, title: String, content: String, lastUpdated: { type: Date, default: Date.now }
}, schemaOptions);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
const PrivacyRecord = mongoose.models.PrivacyRecord || mongoose.model("PrivacyRecord", PrivacyRecordSchema);
const SecurityLog = mongoose.models.SecurityLog || mongoose.model("SecurityLog", SecurityLogSchema);
const Policy = mongoose.models.Policy || mongoose.model("Policy", PolicySchema);
const LawKnowledge = mongoose.models.LawKnowledge || mongoose.model("LawKnowledge", LawKnowledgeSchema);

// ────── [익스프레스 앱 구성] ──────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

// 모든 API 요청 시 DB 연결 확인
app.use(async (req, res, next) => {
  try { 
    await connectToDatabase(); 
    next(); 
  } catch (err) { 
    res.status(500).json({ 
      error: "데이터베이스 연결 실패", 
      message: "Vercel 환경변수 및 MongoDB Atlas Network Access(0.0.0.0/0)를 확인하세요.",
      detail: err.message
    }); 
  }
});

// ────── [보안 미들웨어] ──────
const verifyToken = (req, res, next) => {
  const token = (req.headers["authorization"] || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "인증 토큰 없음" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(403).json({ error: "세션 만료" }); }
};

const checkAccess = (perm) => async (req, res, next) => {
  const user = await Admin.findById(req.user.uid);
  if (user && (user.role === 'admin' || (user.permissions && user.permissions.includes(perm)))) return next();
  res.status(403).json({ error: "권한 부족" });
};

// ────── [API 엔드포인트] ──────

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// 시스템 초기화 (최초 1회 실행)
app.post("/api/admin/init", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(400).json({ error: "이미 초기화된 시스템입니다." });
    
    const hashedPass = await bcrypt.hash("cert1234", 10);
    await Admin.create({
      email: "admin@cert.pms", password: hashedPass, name: "CERT총괄", role: "admin",
      licenseExpiry: new Date("2099-12-31"), 
      permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"]
    });
    
    await LawKnowledge.create({ 
      knowledgeId: "pipa_base", 
      title: "개인정보 보호법 (기본)", 
      content: "제30조에 따른 처리방침 수립 의무 준수", 
      lastUpdated: new Date() 
    });
    
    res.json({ success: true, message: "마스터 계정(admin@cert.pms) 생성 완료" });
  } catch (err) { res.status(500).json({ error: "초기화 실패", detail: err.message }); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: "이미 존재하는 이메일입니다." });
    
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await Admin.create({ email, password: hashedPass, name });
    const token = jwt.sign({ uid: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role, permissions: user.permissions, licenseExpiry: user.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "회원가입 처리 실패", detail: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "아이디 또는 비밀번호가 틀렸습니다." });
    
    const token = jwt.sign({ uid: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role, permissions: user.permissions, licenseExpiry: user.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "로그인 처리 중 서버 오류", detail: err.message }); }
});

app.get("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const user = await Admin.findById(req.user.uid).select("-password");
    if (!user) return res.status(404).send();
    res.json(user);
  } catch (err) { res.status(500).send(); }
});

// (기타 통계 및 정책 API는 생략 - 필요한 경우 추가 구현 가능)

if (process.env.NODE_ENV !== 'production') {
  const PORT = 8080;
  app.listen(PORT, () => console.log(`[CERT] Local Server: http://localhost:${PORT}`));
}

export default app;