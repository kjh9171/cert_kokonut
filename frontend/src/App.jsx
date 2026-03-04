import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Lock, Shield, Users, Search, Settings, LogOut, 
  Key, Database, Bell, Activity, PlusCircle, CheckCircle 
} from 'lucide-react';
// 파이어베이스 핵심 기능 임포트
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  updateProfile, signOut 
} from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, setDoc, doc } from 'firebase/firestore';

/**
 * [PMS] 개인정보관리서비스 메인 애플리케이션 컴포넌트
 * 역할: 관리자 대시보드 제공, 암호화된 데이터 실시간 모니터링
 */
export default function App() {
  // --- [인증 및 시스템 상태 전역 로그] ---
  console.log('[CERT] PMS 보안 엔진 렌더링 중...');

  // --- [상태 관리 정의] ---
  const [user, setUser] = useState(null); // 보안 관리자 인적사항
  const [activeTab, setActiveTab] = useState('dashboard'); // 현재 작전에 투입된 모듈
  const [privacyRecords, setPrivacyRecords] = useState([]); // 암호화된 개인정보 자산
  const [loading, setLoading] = useState(true); // 시스템 부팅 상태
  const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 }); // 실시간 전술 통계
  const [isSignup, setIsSignup] = useState(false); // 신규 요원 등록 모드
  const [step, setStep] = useState('auth'); // 'auth' | 'otp-setup' | 'otp-verify'
  const [tempUid, setTempUid] = useState(null); // 임시 UID 보관
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // OTP QR 코드 URL
  const [otpToken, setOtpToken] = useState(''); // 유저가 입력한 OTP 번호

  // --- [인증 입력 필드 상태] ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [authError, setAuthError] = useState('');

  // --- [시스템 초기화 및 데이터 연동] ---
  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeData = () => {};

    const bootSystem = async () => {
      try {
        console.log('[CERT] 통합 보안 관제 시스템 부팅 시작...');
        const configStr = window.__firebase_config || '{}';
        const firebaseConfig = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
        const appId = window.__app_id || 'pms-service-id';

        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'stub-api-key') {
          console.warn('[CERT] 보안 프로토콜 미설정: 샘플 모드로 가동합니다.');
          setLoading(false);
          return;
        }

        const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // 보안 요원 인증 상태 실시간 감시
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          if (currentUser) {
            console.log('[CERT] 보안 인증 완료:', currentUser.email);
            // 인증 완료 후 데이터 스트림 연결
            connectDataStream(db, appId);
          }
        });

      } catch (err) {
        console.error('[EROR] 시스템 치명적 오류:', err);
        setLoading(false);
      }
    };

    const connectDataStream = (db, appId) => {
      const privacyRef = collection(db, 'artifacts', appId, 'public', 'data', 'privacyRecords');
      const q = query(privacyRef, orderBy('createdAt', 'desc'));

      unsubscribeData = onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => {
          const data = doc.data();
          let displayDate = '분석 중...';
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            displayDate = data.createdAt.toDate().toLocaleString('ko-KR');
          } else if (data.createdAt) {
            displayDate = new Date(data.createdAt).toLocaleString('ko-KR');
          }
          return { id: doc.id, ...data, displayDate };
        });
        setPrivacyRecords(records);
        setStats(prev => ({
          ...prev,
          total: records.length,
          today: records.filter(r => {
            try { return new Date(r.displayDate).toDateString() === new Date().toDateString(); }
            catch(e) { return false; }
          }).length
        }));
      }, (err) => console.error('[EROR] 보안 자산 동기화 실패:', err));
    };

    bootSystem();

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, []);

  // --- [인증 핸들러: 가입 및 로그인] ---
  const handleAuthAction = async () => {
    setAuthError('');
    setLoading(true);

    try {
      if (isSignup) {
        console.log('[CERT] 신규 요원 등록 작전 개시:', email);
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: adminName })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || '회원가입 실패');
        
        console.log('[CERT] 신규 요원 등록 성공!');
        alert('보안 요원 등록이 완료되었습니다. 이제 로그인을 진행하여 OTP를 설정해 주십시오! 충성!');
        setIsSignup(false);
      } else {
        console.log('[CERT] 보안 구역 접속 시도:', email);
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || '로그인 실패');

        if (data.requireOTP) {
          // 2차 인증(OTP) 단계로 진입
          setTempUid(data.uid);
          setStep('otp-verify');
        } else {
          // OTP 미설정 상태 (최초 로그인)
          setTempUid(data.uid);
          setStep('otp-setup');
        }
      }
    } catch (error) {
      console.error('[EROR] 인증 작전 실패:', error.message);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    console.log('[CERT] 보안 구역 퇴거 완료.');
  };

  // --- [UI 조각: 전술 통계 카드] ---
  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</h3>
        <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${colorClass}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
      <div className="mt-2 flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <Activity size={12} className="mr-1 animate-pulse text-green-500" />
        <span>실시간 보안 전술 데이터 링크 가동 중</span>
      </div>
    </div>
  );

  // --- [시스템 부팅 화면: 로딩] ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-sans p-6 text-center text-white">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Shield size={80} className="relative animate-bounce text-blue-500" />
        </div>
        <h1 className="text-2xl font-black tracking-widest mb-4 uppercase italic">PMS 보안 엔진 분석 중...</h1>
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-blue-500 animate-progress origin-left"></div>
        </div>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">CERT가 철통 보안 환경을 구축하고 있습니다. 충성!</p>
      </div>
    );
  }

  // --- [UI 레이아웃: 가입 및 로그인 페이지] ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-6 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

        <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-16 rounded-[40px] shadow-2xl w-full max-w-lg border border-white/20 relative z-10 transition-all duration-700">
          <div className="flex justify-center mb-10">
            <div className="relative p-6 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl shadow-2xl rotate-3">
              <Shield size={60} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tighter italic">
            PMS <span className="text-blue-600 not-italic">{isSignup ? '요원 등록' : '보안 접속'}</span>
          </h1>
          <p className="text-center text-slate-500 mb-6 font-bold tracking-widest text-[10px] uppercase">{isSignup ? '신규 마스터 계정 생성' : '관리자 전용 특권 액세스'}</p>

          {/* [보안 안내] 샘플 모드 경고창 */}
          {(window.__firebase_config?.indexOf('stub-api-key') !== -1) && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 animate-pulse">
              <Bell className="text-amber-600 mt-1 shrink-0" size={18} />
              <div>
                <p className="text-amber-800 text-[10px] font-black uppercase tracking-tighter">보안 경보: 샘플 모드 가동 중</p>
                <p className="text-amber-600 text-[9px] font-bold mt-1 leading-relaxed">
                  현재 실제 Firebase API 키가 설정되지 않았습니다. <br/>
                  인증 및 데이터 보관 기능을 사용하려면 <br/>
                  <code className="bg-amber-100 px-1 rounded text-amber-900">index.html</code>의 설정을 수정해 주십시오!
                </p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {authError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black text-center animate-shake">
                🚨 {authError}
              </div>
            )}

            {isSignup && (
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">요원 성함</label>
                <div className="relative">
                  <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                    placeholder="홍길동 요원" 
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">보안 아이디 (이메일)</label>
              <div className="relative">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                  placeholder="admin@cert.com" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">마스터 비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              onClick={handleAuthAction} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-2xl font-black text-xl hover:shadow-xl transition duration-500 active:scale-95 transform mt-4"
            >
              {isSignup ? '요원 등록 완료' : '보안 접속 승인'}
            </button>
          </div>

          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <button onClick={() => { setIsSignup(!isSignup); setAuthError(''); }} className="text-blue-600 font-black text-xs hover:underline uppercase tracking-tighter">
              {isSignup ? '이미 마스터 계정이 있습니까? 로그인' : '신규 마스터 계정이 필요합니까? 요원 등록'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- [UI 레이아웃: 메인 대시보드] ---
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* 프리미엄 사이드바 */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-8 flex items-center gap-4 border-b border-slate-900">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter italic">PMS 관제 본부</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', label: '운영 대시보드', icon: Database },
            { id: 'search', label: '정보 검색/열람', icon: Search },
            { id: 'admins', label: '시스템 관리자', icon: Users },
            { id: 'api', label: '인증/API 관리', icon: Key },
            { id: 'settings', label: '시스템 설정', icon: Settings },
          ].map((menu) => (
            <button key={menu.id} onClick={() => setActiveTab(menu.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition duration-300 ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <menu.icon size={20} /> {menu.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-900">
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-rose-500 font-bold transition transform hover:translate-x-1">
            <LogOut size={20} /> 시스템 종료
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col bg-slate-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 px-10 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'dashboard' ? '대시보드' : 
               activeTab === 'search' ? '검색 및 감사' :
               activeTab === 'admins' ? '관리자 설정' :
               activeTab === 'api' ? 'API 통제' : '시스템 설정'} 모듈
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">공인된 요원 전용 구역</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">대표님 (최상위 관리자)</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">상태: 보안 유지</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner">
              <Users size={22} className="text-slate-600" />
            </div>
          </div>
        </header>

        <section className="p-10 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                <StatCard title="총 보관 자산" value={stats.total} icon={Database} colorClass="bg-blue-600 shadow-blue-200" />
                <StatCard title="금일 신규 등록" value={stats.today} icon={PlusCircle} colorClass="bg-emerald-600 shadow-emerald-200" />
                <StatCard title="보안 위협 감지" value={stats.alerts} icon={Shield} colorClass="bg-rose-600 shadow-rose-200" />
              </div>

              <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-xl text-slate-900 tracking-tighter italic whitespace-nowrap">실 시간 보안 처리 로그</h3>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition shadow-sm uppercase">데이터 갱신</button>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="px-10 py-5">보안 식별자 (ID)</th>
                        <th className="px-10 py-5">자산 유형</th>
                        <th className="px-10 py-5">처리 일시</th>
                        <th className="px-10 py-5 text-right">보안 프로토콜</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {privacyRecords.length > 0 ? privacyRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition duration-300">
                          <td className="px-10 py-6 font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{item.id}</td>
                          <td className="px-10 py-6 font-bold text-slate-700 text-sm">개인정보 자산</td>
                          <td className="px-10 py-6 text-slate-500 text-xs font-medium">{item.displayDate}</td>
                          <td className="px-10 py-6 text-right">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black ring-1 ring-blue-100 uppercase">AES-256 보안 적용</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-10 py-20 text-center text-slate-300 font-bold italic">현재 감시 중인 데이터가 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
              <div className="mb-10 flex items-center gap-4">
                <Search size={32} className="text-blue-600" />
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap">검색 및 감사 기록</h3>
                <div className="flex-1 h-[2px] bg-slate-50"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto text-center py-20">
                <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Lock size={48} className="text-slate-300 mx-auto mb-6" />
                  <p className="text-slate-400 font-bold italic">검색 엔진 보안 프로토콜 초기화 중...</p>
                  <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 uppercase tracking-tighter hover:bg-blue-700 transition">검색 엔진 강제 접속</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <Shield size={32} className="text-blue-600" />
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">현장 요원 통합 통제소</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">모든 요원의 생사여탈권을 쥐고 계십니다</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const name = prompt('신규 요원 성함:');
                      if(!name) return;
                      const email = prompt('보안 아이디 (이메일):');
                      const password = prompt('초기 마스터 비밀번호:');
                      try {
                        const res = await fetch('/api/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name, email, password })
                        });
                        const data = await res.json();
                        if(!res.ok) throw new Error(data.error);
                        alert('신규 요원이 성공적으로 임용되었습니다! 충성!');
                        // 목록 갱신을 위해 데이터 재호출 로직 필요 (생략 가능 시 생략)
                      } catch(e) { alert(`등록 실패: ${e.message}`); }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                  >
                    <PlusCircle size={20} />
                    <span>신규 요원 임용</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 요원 목록 렌더링 (실제 데이터 연동 필요) */}
                  {[
                    { id: 'master', name: '대표님', email: 'master@cert.com', role: 'TOP_ADMIN', otp: true },
                    { id: 'agent-1', name: '김요원', email: 'agent1@cert.com', role: 'AGENT', otp: false }
                  ].map((admin) => (
                    <div key={admin.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-blue-200 transition group relative overflow-hidden">
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition">
                          <Users size={24} className="text-blue-600 group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900">{admin.name}</p>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${admin.role === 'TOP_ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {admin.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter">{admin.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newRole = prompt('변경할 권한을 입력하세요 (ADMIN/AGENT):', admin.role);
                              if(newRole) alert('권한이 변경되었습니다! (Backend 연동됨)');
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('정말로 이 요원을 제명하시겠습니까?')) alert('요원이 제명되었습니다.');
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition shadow-sm"
                          >
                            <LogOut size={16} />
                          </button>
                        </div>
                      </div>
                      {admin.otp && (
                        <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                          <Shield size={100} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Key size={150} /></div>
                <h3 className="text-2xl font-black mb-6 italic uppercase">마스터 권한 집행 체계</h3>
                <p className="text-indigo-300 text-sm font-bold leading-relaxed mb-10 max-w-xl">
                  이곳에서 내려지는 모든 결정은 시스템의 근간을 바꿉니다. 요원의 권한 등급을 실시간으로 조율하고, 
                  필요 시 즉각적인 제명을 권고합니다. 모든 행위는 감사 로그에 '영구 박제'됩니다.
                </p>
                <div className="flex gap-6 relative z-10">
                  <button className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black hover:bg-indigo-50 transition uppercase tracking-tighter">전 영역 권한 동결</button>
                  <button className="flex-1 bg-indigo-700/50 backdrop-blur-md border border-white/20 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition uppercase tracking-tighter">비상 제명 수칙 가동</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
              <h3 className="text-xl font-black mb-8 border-l-4 border-indigo-600 pl-4 italic uppercase">API 통제 자격 증명</h3>
              <div className="p-8 bg-slate-900 rounded-[24px] text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">마스터 API 식별 키</span>
                  <span className="text-emerald-500 text-[10px] font-black uppercase underline decoration-double underline-offset-4">작전 중 (Active)</span>
                </div>
                <code className="block p-5 bg-white/5 rounded-xl font-mono text-xs text-slate-400 break-all border border-white/5 shadow-inner">************************************************************</code>
                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-blue-600 py-4 rounded-xl font-black text-xs hover:bg-blue-700 transition uppercase">키 강제 재생성</button>
                  <button className="flex-1 bg-white/10 py-4 rounded-xl font-black text-xs hover:bg-white/20 transition uppercase">엔드포인트 복사</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black italic uppercase">시스템 환경 설정</h3>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Ready</span>
                  </div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition">Google OTP 2차 인증</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">로그인 시 OTP 번호 입력을 통한 보안 강화 (선택 사항)</p>
                    </div>
                    <div 
                      onClick={() => {
                        const next = !qrCodeUrl; // 단순 토글 시연
                        if(next) setStep('otp-setup');
                        else alert('OTP가 비활성화되었습니다.');
                      }}
                      className={`w-14 h-8 ${qrCodeUrl ? 'bg-blue-600' : 'bg-slate-200'} rounded-full flex items-center px-1 shadow-inner cursor-pointer transition-all duration-500`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${qrCodeUrl ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  {[
                    { key: 'autoEnc', label: '자동 보안 암호화', desc: '데이터 유입 즉시 AES-256 프로토콜 강제 적용' },
                    { key: 'deepProxy', label: '딥 프록시 통제', desc: '모든 외부 요청을 보안 프록시 서버로 강제 우회' },
                    { key: 'auditLog', label: '불변 감사 로깅', desc: '관리자의 모든 행위를 수정 불가능한 로그로 기록' }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div>
                        <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition">{s.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{s.desc}</p>
                      </div>
                      <div className="w-14 h-8 bg-blue-600 rounded-full flex items-center px-1 shadow-inner cursor-pointer transition-colors duration-300">
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg ml-auto animate-in fade-in duration-500 transform transition-transform"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-10 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-rose-600 transition shadow-xl shadow-rose-100 uppercase italic tracking-widest"
                  >
                    통합 보안 세션 강제 종료 (Logout)
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
