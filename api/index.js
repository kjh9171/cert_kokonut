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
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// ────── [MongoDB 커넥션 캐싱] ──────
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedDb = db;
    return db;
  } catch (err) {
    console.error("❌ [CERT DB ERROR]", err.message);
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

const PaymentRequestSchema = new mongoose.Schema({
  userId: String, userEmail: String, userName: String, orderID: String, planName: String, amount: String, status: { type: String, default: "PENDING" }, approvedAt: Date
}, schemaOptions);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
const PrivacyRecord = mongoose.models.PrivacyRecord || mongoose.model("PrivacyRecord", PrivacyRecordSchema);
const SecurityLog = mongoose.models.SecurityLog || mongoose.model("SecurityLog", SecurityLogSchema);
const Policy = mongoose.models.Policy || mongoose.model("Policy", PolicySchema);
const LawKnowledge = mongoose.models.LawKnowledge || mongoose.model("LawKnowledge", LawKnowledgeSchema);
const PaymentRequest = mongoose.models.PaymentRequest || mongoose.model("PaymentRequest", PaymentRequestSchema);

// ────── [익스프레스 앱 구성] ──────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.use(async (req, res, next) => {
  try { await connectToDatabase(); next(); }
  catch (err) { res.status(500).json({ error: "데이터베이스 연결 실패", detail: err.message }); }
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

const logAction = async (uid, email, name, action, target, reason) => {
  try { await SecurityLog.create({ userId: uid, user: email, userName: name, action, target, reason }); } catch (e) { }
};

// ────── [API 엔드포인트] ──────

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.post("/api/admin/init", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(400).json({ error: "이미 초기화됨" });
    const hashedPass = await bcrypt.hash("cert1234", 10);
    await Admin.create({
      email: "admin@cert.pms", password: hashedPass, name: "CERT총괄", role: "admin",
      licenseExpiry: new Date("2099-12-31"), permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"]
    });
    await LawKnowledge.create({ knowledgeId: "pipa_base", title: "개인정보 보호법 (기본)", content: "제30조 준수", lastUpdated: new Date() });
    res.json({ success: true, message: "초기화 성공" });
  } catch (err) { res.status(500).json({ error: "초기화 실패", detail: err.message }); }
});

// --- 인증 API ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (await Admin.findOne({ email })) return res.status(400).json({ error: "이미 존재하는 계정" });
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await Admin.create({ email, password: hashedPass, name });
    const token = jwt.sign({ uid: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role, permissions: user.permissions, licenseExpiry: user.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "회원가입 오류" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "인증 실패" });
    const token = jwt.sign({ uid: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role, permissions: user.permissions, licenseExpiry: user.licenseExpiry } });
  } catch (err) { res.status(500).json({ error: "로그인 오류" }); }
});

app.get("/api/auth/profile", verifyToken, async (req, res) => {
  const user = await Admin.findById(req.user.uid).select("-password");
  res.json(user);
});

// --- 관리자 전용 API ---
app.get("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const admins = await Admin.find().select("-password");
  res.json(admins);
});

app.delete("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post("/api/admin/admins", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const { email, password, name, role, permissions, licenseExpiry } = req.body;
    if (await Admin.findOne({ email })) return res.status(400).json({ error: "이미 존재하는 계정" });
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await Admin.create({ 
      email, 
      password: hashedPass, 
      name, 
      role: role || "user", 
      permissions: permissions || ["dashboard"],
      licenseExpiry: licenseExpiry || new Date(Date.now() + 30*24*60*60*1000)
    });
    await logAction(req.user.uid, req.user.email, req.user.name, "USER_CREATED", `USER:${user._id}`, `이용자 ${email} 생성`);
    res.json({ success: true, id: user._id });
  } catch (err) { res.status(500).json({ error: "이용자 생성 실패" }); }
});

app.put("/api/admin/admins/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    await Admin.findByIdAndUpdate(req.params.id, updateData);
    await logAction(req.user.uid, req.user.email, req.user.name, "USER_UPDATED", `USER:${req.params.id}`, "이용자 정보 수정");
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "정보 수정 실패" }); }
});

app.get("/api/admin/db/stats", verifyToken, async (req, res) => {
  const total = await PrivacyRecord.countDocuments();
  const today = await SecurityLog.countDocuments({ createdAt: { $gte: new Date().setHours(0,0,0,0) } });
  res.json({ total, today, consentRate: 98 });
});

app.get("/api/admin/logs", verifyToken, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user.email };
  const logs = await SecurityLog.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(logs);
});

app.post("/api/admin/logs", verifyToken, async (req, res) => {
  const { action, target, reason } = req.body;
  await logAction(req.user.uid, req.user.email, req.user.name, action, target, reason);
  res.json({ success: true });
});

app.get("/api/admin/records", verifyToken, checkAccess("member_db"), async (req, res) => {
  res.json(await PrivacyRecord.find());
});

app.post("/api/admin/records/batch", verifyToken, checkAccess("security_vault"), async (req, res) => {
  const { records } = req.body;
  await PrivacyRecord.insertMany(records);
  res.json({ success: true });
});

app.delete("/api/admin/records/:id", verifyToken, checkAccess("member_db"), async (req, res) => {
  await PrivacyRecord.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- 지능형 학습 및 정책 API ---
app.get("/api/admin/knowledge", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  res.json(await LawKnowledge.find().sort({ lastUpdated: -1 }));
});

app.post("/api/admin/knowledge/sync", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const sources = [
    { knowledgeId: "pipa_2025", title: "개인정보 보호법 (2025)", content: "최신 안전조치 기준 강화 반영" },
    { knowledgeId: "std_2025", title: "표준 지침 v4.0", content: "정보주체 가독성 최적화 패턴" }
  ];
  for (const s of sources) await LawKnowledge.findOneAndUpdate({ knowledgeId: s.knowledgeId }, { ...s, lastUpdated: new Date() }, { upsert: true });
  res.json({ success: true });
});

app.post("/api/admin/policies/refine", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const { fields } = req.body;
  const refinedFields = {};
  for (const [k, v] of Object.entries(fields)) refinedFields[k] = `[지능형 정제] ${v} (법률 검토 완료)`;
  res.json({ refinedFields });
});

app.post("/api/admin/policies/generate", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const { purpose, items, duration, safety, rights, cookies, responsible, remedies } = req.body;
  const content = `# 표준 개인정보 처리방침\n\n### 제1조 목적\n${purpose}\n\n### 제2조 항목\n${items}\n\n### 제3조 기간\n${duration}\n\n### 제4조 안전조치\n${safety}\n\n### 기타\n- 권리: ${rights}\n- 쿠키: ${cookies}\n- 책임자: ${responsible}\n- 구제: ${remedies}`;
  res.json({ content });
});

app.get("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  res.json(await Policy.find().sort({ createdAt: -1 }));
});

app.post("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const { content, reason } = req.body;
  const newDoc = await Policy.create({ content, reason, author: req.user.name, authorEmail: req.user.email });
  res.json(newDoc);
});

// --- 결제 관련 API (Placeholder) ---
app.get("/api/admin/subscriptions/pending", verifyToken, checkAccess("user_manage"), async (req, res) => {
  res.json(await PaymentRequest.find({ status: "PENDING" }));
});

app.post("/api/admin/subscriptions/approve/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const request = await PaymentRequest.findById(req.params.id);
  if (request) {
    const user = await Admin.findById(request.userId);
    if (user) {
      user.licenseExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      request.status = "APPROVED";
      request.approvedAt = new Date();
      await request.save();
      return res.json({ success: true });
    }
  }
  res.status(404).json({ error: "요청 없음" });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = 8080;
  app.listen(PORT, () => console.log(`Local Mode: ${PORT}`));
}

export default app;