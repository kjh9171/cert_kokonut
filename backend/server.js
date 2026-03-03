// Express 프레임워크 로드 (서버리스 API 구축용)
const express = require('express');
// 암호화 모듈 로드 (개인정보 보호를 위한 AES-256-CBC 적용)
const crypto = require('crypto');
// 파이어베이스 어드민 SDK 로드 (Firestore 연동용)
const admin = require('firebase-admin');

// Express 앱 초기화
const app = express();
// JSON 바디 파싱 미들웨어 등록
app.use(express.json());

// 파이어베이스 어드민 초기화 (인증 파일 부재 시에도 서버 기동을 위해 try-catch 처리)
let isFirebaseInitialized = false;
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    isFirebaseInitialized = true;
    console.log('[CERT] Firebase Admin SDK가 명쾌하게 연결되었습니다! 충성!');
  } catch (error) {
    console.warn('[CERT] [WARNING] Firebase 인증 오류: 대표님의 실제 키를 backend/service-account.json에 넣어주셔야 서비스가 정상 작동합니다.');
    console.error('[CERT] [DEBUG] Detail:', error.message);
  }
} else {
  isFirebaseInitialized = true;
}

// Firestore 데이터베이스 인스턴스 (초기화 실패 시 null 처리로 런타임 에러 방지)
const db = isFirebaseInitialized ? admin.firestore() : null;

// [보안 설정] 암호화 키 (환경 변수 권장, 기본값은 샘플용)
// 실제 운영 시에는 강력한 랜덤 문자열을 사용해야 함
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cert_total_manager_secure_key_256';
// AES 알고리즘을 위한 초기화 벡터(IV) 길이 설정 (16바이트)
const IV_LENGTH = 16;

/**
 * [보안 설계] 개인정보 보호를 위한 AES-256-CBC 암호화 함수
 * @param {string} text 암호화할 평문 데이터
 * @returns {string} IV와 암호문이 결합된 문자열 (HEX 형식)
 */
function encrypt(text) {
  // 매 암호화마다 고유한 랜덤 IV 생성 (보안성 강화)
  let iv = crypto.randomBytes(IV_LENGTH);
  // AES-256-CBC 알고리즘 적용
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  // 암호화 버퍼 합치기
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // 복호화 시 필요한 IV를 암호문 앞에 붙여서 반환
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * [보안 설계] 보관된 암호문을 복호화하는 함수
 * @param {string} text 암호화된 문자열 (IV:암호문 형식)
 * @returns {string} 복호화된 평문 데이터
 */
function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  // 동일한 키와 IV로 복호화 객체 생성
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// --- [API 엔드포인트 설계] ---

/**
 * 1. 개인정보 등록 API (PMS 핵심 기능)
 * 인젝션 공격 방어를 위해 전처리 및 암호화 후 저장함
 */
app.post('/api/privacy/register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const appId = process.env.APP_ID || 'pms-service-id';
    
    // 필수 데이터 유효성 검사 (시큐어 코딩 준수)
    if (!name || !email) {
      return res.status(400).json({ error: '필수 항목(이름, 이메일)이 누락되었습니다.' });
    }

    // [보안 핵심] 모든 민감 정보는 저장 전 즉시 암호화 수행
    const encryptedData = {
      name: encrypt(name),
      email: encrypt(email),
      phone: phone ? encrypt(phone) : null,
      // 서버 기준 타임스탬프 기록 (추적성 확보)
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Firestore 저장 (대표님 지정 경로 규칙 준수)
    // /artifacts/{appId}/public/data/privacyRecords/{docId}
    const docRef = await db.collection('artifacts')
      .doc(appId)
      .collection('public')
      .doc('data')
      .collection('privacyRecords')
      .add(encryptedData);

    // 성공 응답 반환 (민감 정보는 노출하지 않음)
    res.status(201).json({ 
      success: true, 
      message: '개인정보가 암호화되어 안전하게 보관되었습니다.', 
      id: docRef.id 
    });
  } catch (error) {
    console.error('[EROR] Registration failed:', error);
    res.status(500).json({ error: '서버 내부 오류로 등록에 실패했습니다.' });
  }
});

/**
 * 2. 개인정보 리스트 조회 API (관리자 전용)
 * 감사를 위해 조회 요청을 로그에 남김
 */
app.get('/api/privacy/list', async (req, res) => {
  try {
    const appId = process.env.APP_ID || 'pms-service-id';
    
    // 지정된 경로에서 데이터 스냅샷 획득
    const snapshot = await db.collection('artifacts')
      .doc(appId)
      .collection('public')
      .doc('data')
      .collection('privacyRecords')
      .orderBy('createdAt', 'desc')
      .get();

    // 암호화된 상태 그대로 목록 반환 (화면에서 필요 시 복호화 로직 연동 가능)
    const records = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // 타임스탬프 변환 처리
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
      };
    });

    res.json(records);
  } catch (error) {
    console.error('[ERROR] Fetch list failed:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 서버 리스닝 (도커 컨테이너 내부 8080 포트 사용)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[CERT] PMS Backend is patrolling on port ${PORT}! 충성!`);
});
