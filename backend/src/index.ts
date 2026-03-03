import { Hono } from "hono"; // 서버리스 API를 위한 Hono 프레임워크
import { sign, verify } from "hono/jwt"; // 인증을 위한 JWT 유틸리티
import { cors } from "hono/cors"; // 크로스 오리진 리소스 공유 설정

// 환경 변수 및 바인딩 타입 정의
type Bindings = {
  DB: D1Database; // Cloudflare D1 데이터베이스 바인딩
  JWT_SECRET: string; // JWT 서명용 비밀키
  MASTER_KEY: string; // 암호화용 마스터키
};

const app = new Hono<{ Bindings: Bindings }>();

// 모든 응답에 CORS 설정 적용 (보안을 고려하여 실배포 시에는 도메인 제한 권장)
app.use("*", cors());

// --- [보안 유틸리티] ---

/**
 * Web Crypto API를 사용한 AES-256-GCM 암호화 함수
 * @param text 암호화할 평문
 * @param keyStr 암호화 키 (문자열)
 * @returns Base64 인코딩된 암호문 (IV 포함)
 */
async function encryptData(text: string, keyStr: string) {
  const encoder = new TextEncoder(); // 문자열을 Uint8Array로 변환
  const data = encoder.encode(text); // 평문 데이터

  const keyBuf = encoder.encode(keyStr.padEnd(32, "0").slice(0, 32)); // 키를 32바이트(256비트)로 맞춤
  const key = await crypto.subtle.importKey("raw", keyBuf, "AES-GCM", false, [
    "encrypt",
  ]); // 암호화용 키 객체 생성

  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM용 12바이트 랜덤 IV 생성
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  ); // AES-GCM 방식으로 암호화

  // IV와 암호문을 합쳐서 Base64로 반환
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Web Crypto API를 사용한 AES-256-GCM 복호화 함수
 * @param encryptedBase64 Base64 인코딩된 암호문
 * @param keyStr 복호화 키
 * @returns 복호화된 평문
 */
async function decryptData(encryptedBase64: string, keyStr: string) {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  ); // Base64 디코딩
  const iv = combined.slice(0, 12); // 처음 12바이트는 IV
  const data = combined.slice(12); // 나머지는 실제 암호문

  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(keyStr.padEnd(32, "0").slice(0, 32));
  const key = await crypto.subtle.importKey("raw", keyBuf, "AES-GCM", false, [
    "decrypt",
  ]); // 복호화용 키 객체 생성

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  ); // 복호화 수행

  return new TextDecoder().decode(decrypted); // 평문 문자열로 변환
}

// --- [API 엔드포인트] ---

// 1. 로그인 API (기업 사용자 및 시스템 관리자 공용)
app.post("/api/auth/login", async (c) => {
  const { username, password, role } = await c.req.json(); // 요청 데이터 파싱

  // [보안 주의] 실배포 시에는 DB에서 사용자 확인 및 비밀번호 해시 검증 필수
  // 본 샘플에서는 로직 흐름 확인을 위해 단순화된 검증 수행
  if (username && password) {
    const payload = {
      sub: username,
      role: role || "user", // 역할 기반 접근 제어 (RBAC)를 위한 정보 포함
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 토큰 만료 시간 (24시간)
    };
    const token = await sign(payload, c.env.JWT_SECRET); // JWT 생성 및 서명
    return c.json({ success: true, token, role: payload.role });
  }

  return c.json({ success: false, message: "Invalid credentials" }, 401);
});

// 2. 대시보드 통계 조회 (상황에 맞는 더미 데이터 반환)
app.get("/api/dashboard/stats", async (c) => {
  // 실제 환경에서는 D1 쿼리를 통해 통계 산출
  return c.json({
    totalRecords: 1250, // 총 보유 개인정보 수
    encryptionRate: 100, // 암호화 적용 현황 (%)
    apiCalls: 452, // 오늘 발생한 API 호출 수
    securityAlerts: 0, // 보안 경고 수
  });
});

// 3. 개인정보 리스트 조회 (기본 마스킹 처리)
app.get("/api/users/list", async (c) => {
  // 실제 환경: return await c.env.DB.prepare("SELECT * FROM users").all();
  const dummyUsers = [
    {
      id: 1,
      name: "홍*동",
      email: "h***@example.com",
      phone: "010-****-1234",
      company: "A사",
    },
    {
      id: 2,
      name: "이*순",
      email: "s***@example.com",
      phone: "010-****-5678",
      company: "B사",
    },
  ];
  return c.json(dummyUsers);
});

// 4. 데이터 복호화 요청 및 감사 로그 기록
app.post("/api/users/decrypt", async (c) => {
  const { userId, field } = await c.req.json();
  const authHeader = c.req.header("Authorization");

  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  // JWT 토큰 검증 및 사용자 식별
  const token = authHeader.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);

  // [보안 핵심] 모든 복호화 작업에 대해 감사 로그 생성 (ISMS 기준 준수)
  console.log(
    `[AUDIT LOG] User ${payload.sub} decrypted ${field} of User ${userId} at ${new Date().toISOString()}`,
  );

  // 실제 환경에서는 DB에 감사 로그 저장
  // await c.env.DB.prepare("INSERT INTO audit_logs (actor, action, target_id, timestamp) VALUES (?, ?, ?, ?)")
  //   .bind(payload.sub, 'DECRYPT', userId, Date.now()).run();

  // 샘플 복호화 데이터 반환 (원래는 DB에서 암호화된 값 가져와서 decryptData 호출)
  const plainValue =
    field === "email" ? "honggildong@example.com" : "010-1234-1234";

  return c.json({ success: true, value: plainValue });
});

// 5. 인프라 관제 (시스템 관리 전용)
app.get("/api/admin/system", async (c) => {
  return c.json({
    status: "Operational", // 서버 상태
    workerUptime: "12d 4h", // 업타임
    d1Usage: "2.4MB / 500MB", // DB 사용량
    errorRate: "0.01%", // 페이로드당 에러율
  });
});

export default app;
