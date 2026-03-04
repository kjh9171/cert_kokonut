// Express 프레임워크 로드 (서버리스 API 구축용)
import express from 'express';
// 암호화 모듈 로드 (AES-256-CBC 및 해시용)
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TOTP } from 'otplib';
import qrcode from 'qrcode';
// 파이어베이스 어드민 SDK 로드 (Firestore 연동용)
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// otplib v13 대응을 위해 TOTP 인스턴스 생성
const authenticator = new TOTP();

// Express 앱 초기화
const app = express();
app.use(express.json());

// [보안 설정] 비밀 키 (환경 변수 권장)
const JWT_SECRET = process.env.JWT_SECRET || 'cert_pms_master_token_key_777';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cert_total_manager_secure_key_256';
const IV_LENGTH = 16;

// 파이어베이스 어드민 초기화
let isFirebaseInitialized = false;
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    isFirebaseInitialized = true;
    console.log('[CERT] Firebase Admin SDK 연결 완료! 충성!');
  } catch (error) {
    console.warn('[CERT] Firebase 인증 오류: service-account.json 확인 필요.');
  }
} else {
  isFirebaseInitialized = true;
}

const db = isFirebaseInitialized ? admin.firestore() : null;

// --- [보안 유틸리티] ---
function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// --- [독자 인증 API] ---

/**
 * 1. 관리자 자체 회원가입 API
 * Firebase Auth를 사용하지 않고 Firestore에 직접 사용자 정보(해시된 PW) 저장
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: '필수 정보 누락' });

    // 중복 이메일 체크
    const userSnapshot = await db.collection('pms_admins').where('email', '==', email).get();
    if (!userSnapshot.empty) return res.status(400).json({ error: '이미 등록된 보안 아이디입니다.' });

    // 비밀번호 해싱 (bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // OTP 시크릿 생성 (최초 1회)
    const otpSecret = authenticator.generateSecret();

    // Firestore 저장
    const userDoc = {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      otpSecret: encrypt(otpSecret), // OTP 시크릿은 암호화해서 보관
      otpEnabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('pms_admins').add(userDoc);
    
    res.status(201).json({ 
      success: true, 
      id: docRef.id,
      message: '보안 요원 등록 성공! 이제 OTP 설정을 진행하십시오.' 
    });
  } catch (error) {
    res.status(500).json({ error: '회원가입 중 서버 오류 발생' });
  }
});

/**
 * 2. 독자 로그인 API (1차: 비밀번호 검증)
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userSnapshot = await db.collection('pms_admins').where('email', '==', email).get();

    if (userSnapshot.empty) return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // 비밀번호 검증
    const isMatched = await bcrypt.compare(password, userData.password);
    if (!isMatched) return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });

    // OTP 완료 여부 확인
    if (userData.otpEnabled) {
      return res.json({ 
        success: true, 
        requireOTP: true, 
        uid: userDoc.id,
        message: 'Google OTP 2차 인증이 필요합니다.' 
      });
    }

    // OTP 미설정 시 (초기 로그인)
    const token = jwt.sign({ uid: userDoc.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ 
      success: true, 
      requireOTP: false, 
      token, 
      user: { email: userData.email, name: userData.name, role: userData.role } 
    });
  } catch (error) {
    res.status(500).json({ error: '로그인 도중 서버 오류 발생' });
  }
});

/**
 * 3. OTP 설정 QR 코드 생성 API
 */
app.post('/api/auth/otp-setup', async (req, res) => {
  try {
    const { uid } = req.body;
    const userDoc = await db.collection('pms_admins').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: '요원을 찾을 수 없습니다.' });

    const userData = userDoc.data();
    // 암호화된 시크릿 복호화 (decrypt 함수 구현 필요 - 생략 후 encrypt 역으로 가정)
    const otpSecret = userData.otpSecret.split(':')[1]; // 샘플용 (실제는 decrypt 사용)
    
    // Google OTP용 URI 생성
    const otpUri = authenticator.toURI({ 
      label: userData.email, 
      issuer: 'PMS_CERT', 
      secret: otpSecret 
    });
    const qrCodeUrl = await qrcode.toDataURL(otpUri);

    res.json({ qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: 'OTP 설정 중 오류 발생' });
  }
});

/**
 * 4. OTP 번호 최종 검증 및 활성화 API (2FA)
 */
app.post('/api/auth/otp-verify', async (req, res) => {
  try {
    const { uid, otpToken, activate } = req.body;
    const userDoc = await db.collection('pms_admins').doc(uid).get();
    const userData = userDoc.data();

    const otpSecret = userData.otpSecret.split(':')[1]; // 샘플용
    const isValid = await authenticator.verify({ token: otpToken, secret: otpSecret });

    if (!isValid) return res.status(401).json({ error: 'OTP 번호가 일치하지 않습니다.' });

    // 설정에서 활성화/비활성화 요청 시 처리
    if (activate !== undefined) {
      await db.collection('pms_admins').doc(uid).update({ otpEnabled: activate });
      return res.json({ success: true, message: `OTP가 ${activate ? '활성화' : '비활성화'} 되었습니다.` });
    }

    const token = jwt.sign({ uid: userDoc.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ 
      success: true, 
      token, 
      user: { email: userData.email, name: userData.name, role: userData.role } 
    });
  } catch (error) {
    res.status(500).json({ error: 'OTP 검증 중 오류 발생' });
  }
});

/**
 * 5. 관리자 전용 요원 관리 (CRUD + 권한 수정)
 */
// 요원 목록 조회
app.get('/api/admin/admins', async (req, res) => {
  try {
    const snapshot = await db.collection('pms_admins').get();
    const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 요원 정보 수정 (권한 포함)
app.put('/api/admin/admins/:id', async (req, res) => {
  try {
    const { updateData } = req.body;
    await db.collection('pms_admins').doc(req.params.id).update(updateData);
    res.json({ success: true, message: '요원 정보가 업데이트되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 요원 삭제
app.delete('/api/admin/admins/:id', async (req, res) => {
  try {
    await db.collection('pms_admins').doc(req.params.id).delete();
    res.json({ success: true, message: '요원이 영구 제명되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. 서비스 이용자 관리 (CRUD)
 */
// 등록
app.post('/api/admin/users', async (req, res) => {
  // 실제 구현 시 권한 체크 로직 포함
  try {
    const { userData } = req.body;
    const docRef = await db.collection('pms_users').add({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 수정/삭제 등 추가 엔드포인트...
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { userData } = req.body;
    await db.collection('pms_users').doc(req.params.id).update(userData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await db.collection('pms_users').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. 데이터베이스 상태 관리 API
 */
app.get('/api/admin/db/stats', async (req, res) => {
  try {
    // 프로젝트 통계 계산 로직
    res.json({
      database: 'Firestore',
      status: 'Healthy',
      collections: ['privacyRecords', 'pms_users', 'pms_admins']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 서버 리스닝 (도커 컨테이너 내부 8080 포트 사용)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[CERT] PMS Backend is patrolling on port ${PORT}! 충성!`);
});
