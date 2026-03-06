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
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ pms_admins: [{ id: "master_admin", email: "admin@cert.pms", password: hashedPass, name: "CERT총괄", role: "admin", licenseExpiry: "2099-12-31T23:59:59.000Z", permissions: ["dashboard", "member_db", "user_manage", "security_vault", "policy_manage", "subscription", "my_settings"], otpEnabled: false, createdAt: new Date().toISOString() }], privacy_records: [], security_logs: [], policies: [] }, null, 2));
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

// ✅ [로깅 보안 강화] 모든 HTTP 요청을 도커 콘솔에 즉시 출력
// 포맷: [시각] 메서드 경로 상태코드 응답시간 - 사용자명
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ────── 전역 로깅 미들웨어 (디버깅용) ──────
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[CERT API CALL] ${req.method} ${req.url} - Body:`, JSON.stringify(req.body));
  }
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "cert_pms_master_token_key_777";

// ────── 보안 미들웨어 ──────
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
    console.log(`[CERT LOGIN] 성공: ${email}`);
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

// ────── 페이팔 결제 API ──────

app.post("/api/paypal/create-order", verifyToken, async (req, res) => {
  try {
    const { planName, amount } = req.body;
    console.log(`[CERT PAYPAL] 주문 생성 개시: ${planName} ($${amount})`);
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ description: `${planName} 구독`, amount: { currency_code: "USD", value: amount.toString() } }] }),
    });
    const data = await response.json();
    if (!response.ok) { console.error("[CERT PAYPAL ERROR] 주문 생성 실패:", JSON.stringify(data)); return res.status(400).json(data); }
    console.log(`[CERT PAYPAL] 주문 생성 완료: ${data.id}`);
    res.json(data);
  } catch (err) { console.error("[CERT ERROR] 결제 생성 중 예외:", err.message); res.status(500).json({ error: "결제 엔진 오류" }); }
});

app.post("/api/paypal/capture-order", verifyToken, async (req, res) => {
  try {
    const { orderID, planName } = req.body;
    console.log(`[CERT PAYPAL] 결제 승인(캡처) 시도: ${orderID}`);
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (data.status === "COMPLETED") {
      console.log(`[CERT PAYPAL] 결제 캡처 성공! DB 등록 개시`);
      await addDoc("payment_requests", {
        userId: req.user.uid, userEmail: req.user.email, userName: req.user.name,
        orderID, planName, status: "PENDING", amount: data.purchase_units[0].payments.captures[0].amount.value
      }, PAYMENTS_DB_PATH);
      await logAction(req.user.uid, req.user.email, req.user.name, "PAYMENT_REQUEST_SUBMITTED", "PAYPAL_ENGINE", `구독 승인 요청: ${planName}`);
      return res.json({ success: true });
    }
    console.error("[CERT PAYPAL ERROR] 결제 미완료:", data.status);
    res.status(400).json({ error: "결제 미완료" });
  } catch (err) { console.error("[CERT ERROR] 캡처 중 예외:", err.message); res.status(500).json({ error: "캡처 오류" }); }
});

// ────── 구독 승인 관리 (관리자 전용) ──────

app.get("/api/admin/subscriptions/pending", verifyToken, checkAccess("user_manage"), async (req, res) => {
  const requests = await getCollection("payment_requests", PAYMENTS_DB_PATH);
  res.json(requests.filter(r => r.status === "PENDING"));
});

app.post("/api/admin/subscriptions/approve/:id", verifyToken, checkAccess("user_manage"), async (req, res) => {
  try {
    console.log(`[CERT ADMIN] 구독 승인 처리 개시: ID ${req.params.id}`);
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
      
      console.log(`[CERT ADMIN] 승인 완료 및 기능 개방: ${request.userEmail}`);
      await logAction(req.user.uid, req.user.email, req.user.name, "SUBSCRIPTION_APPROVED", "ADMIN_ENGINE", `승인 완료: ${request.userEmail}`);
      res.json({ success: true });
    } else { res.status(404).json({ error: "사용자 없음" }); }
  } catch (err) { console.error("[CERT ERROR] 승인 중 예외:", err.message); res.status(500).json({ error: "승인 처리 실패" }); }
});

// ────── 약관/처리방침 관리 및 AI 에이전트 ──────

// 정책 목록 조회 (최신순)
app.get("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  const policies = await getCollection("policies");
  res.json([...policies].reverse());
});

// AI 기반 개인정보처리방침 생성 (표준 가이드라인 및 최신 법령 반영)
app.post("/api/admin/policies/generate", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { 
      purpose, items, duration, outsourcing, thirdParty, 
      rights, destruction, safety, cookies, responsible, access, remedies 
    } = req.body;
    
    console.log(`[CERT AI AGENT] 표준 개인정보 처리방침 생성 개시`);

    // ── 대표님께서 지시하신 표준 시스템 프롬프트 (대한민국 개인정보 보호법 준수) ──
    const systemPrompt = `너는 대한민국 '개인정보 보호법' 및 표준 개인정보 처리방침 가이드라인 전문가이다.
사용자의 입력을 바탕으로 전문적이고 상세한 개인정보 처리방침 문서를 작성하라.

# 참조 원칙 (Reference)
- 개인정보 보호법 제30조(개인정보 처리방침의 수립 및 공개)
- 표준 개인정보 처리방침 작성 지침 준수

# 필수 포함 조항 (Structure)
1. 처리 목적
2. 처리 및 보유 기간
3. 처리하는 개인정보의 항목 (필수/선택 구분)
4. 개인정보의 제3자 제공
5. 개인정보 처리의 위탁
6. 정보주체와 법정대리인의 권리·의무 및 행사방법
7. 개인정보의 파기 절차 및 방법
8. 개인정보의 안전성 확보조치
9. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항
10. 개인정보 보호책임자 및 담당부서
11. 개인정보 열람청구 접수·처리 부서
12. 권익침해 구제방법
13. 영상정보처리기기 설치·운영 (해당 시)
14. 개인정보 처리방침의 변경 (이력 관리)

# 작성 지침
- 격식 있고 명확한 비즈니스 문체를 사용하라.
- 각 조항마다 관련 법적 근거(제15조, 제29조 등)를 명시하라.
- 입력되지 않은 데이터는 '{{추가 확인 필요}}'로 표시하되, 법령에 따른 표준 예시를 덧붙여라.

# 사용자 입력 데이터
- 목적: ${purpose}
- 항목: ${items}
- 기간: ${duration}
- 위탁: ${outsourcing}
- 제공: ${thirdParty || "해당사항 없음"}
- 권리: ${rights}
- 파기: ${destruction}
- 안전조치: ${safety}
- 쿠키: ${cookies}
- 책임자: ${responsible}
- 열람청구: ${access}
- 구제방법: ${remedies}

# 출력 형식: 마크다운(Markdown)`;

    // AI 엔진 시뮬레이션 (표준 템플릿 기반 생성)
    const aiResponse = `# 개인정보 처리방침

안티그래비티(이하 '회사')는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.

### 제1조 (개인정보의 처리 목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
1. **${purpose}**

### 제2조 (개인정보의 처리 및 보유 기간)
① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
- **${duration}**

### 제3조 (처리하는 개인정보의 항목)
회사는 다음의 개인정보 항목을 처리하고 있습니다.
1. 필수항목: **${items}**
2. 선택항목: {{선택항목 입력 확인 필요}}

### 제4조 (개인정보의 제3자 제공)
회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
- 현황: **${thirdParty || "현재 해당사항 없음"}**

### 제5조 (개인정보 처리의 위탁)
① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
- 위탁 업체 및 업무: **${outsourcing}**
② 회사는 위탁계약 체결시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 명문으로 규정하고 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.

### 제6조 (정보주체와 법정대리인의 권리·의무 및 행사방법)
정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
- 행사 방법: **${rights}**

### 제7조 (개인정보의 파기 절차 및 방법)
회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
- 절차 및 방법: **${destruction || "파쇄 또는 전자기적 방법으로 복구 불가능하게 삭제"}**

### 제8조 (개인정보의 안전성 확보조치)
회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다. (제29조 근거)
- **${safety}**

### 제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)
회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다.
- 운영 및 거부: **${cookies}**

### 제10조 (개인정보 보호책임자)
회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
- 성명/부서/연락처: **${responsible}**

### 제11조 (개인정보 열람청구 접수·처리 부서)
정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다.
- 접수 부서: **${access}**

### 제12조 (권익침해 구제방법)
정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.
- **${remedies}**

### 제13조 (개인정보 처리방침의 변경)
이 개인정보 처리방침은 **${new Date().toLocaleDateString()}**부터 적용됩니다.`;

    await logAction(req.user.uid, req.user.email, req.user.name, "POLICY_GENERATED_STANDARD", "POLICY_ENGINE", "표준 가이드라인 기반 정책 생성");
    res.json({ content: aiResponse });
  } catch (err) { console.error("[CERT AI ERROR]", err); res.status(500).json({ error: "AI 생성 실패" }); }
});

// 정책 저장 및 게시
app.post("/api/admin/policies", verifyToken, checkAccess("policy_manage"), async (req, res) => {
  try {
    const { content, reason } = req.body;
    const newPolicy = await addDoc("policies", { content, reason, author: req.user.name, authorEmail: req.user.email });
    await logAction(req.user.uid, req.user.email, req.user.name, "POLICY_PUBLISHED", "POLICY_ENGINE", reason);
    res.json(newPolicy);
  } catch (err) { res.status(500).json({ error: "저장 실패" }); }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log("==========================================");
  console.log(`[CERT] PMS Backend running on port ${PORT}`);
  console.log(`[CERT] Real-time logging is ACTIVE`);
  console.log("==========================================");
});
