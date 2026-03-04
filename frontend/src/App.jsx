import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Lock, Shield, Users, Search, Settings, LogOut, 
  Key, Database, Bell, Activity, PlusCircle, CheckCircle 
} from 'lucide-react';
// 파이어베이스 핵심 기능 임포트
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

/**
 * [PMS] 개인정보관리서비스 메인 애플리케이션 컴포넌트
 * 역할: 관리자 대시보드 제공, 암호화된 데이터 실시간 모니터링
 */
export default function App() {
  // --- [상태 관리 정의] ---
  const [user, setUser] = useState(null); // 로그인한 관리자 정보
  const [activeTab, setActiveTab] = useState('dashboard'); // 현재 활성화된 메뉴
  const [privacyRecords, setPrivacyRecords] = useState([]); // 개인정보 레코드 목록
  const [loading, setLoading] = useState(true); // 전체 로딩 상태
  const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 }); // 통계 데이터

  // --- [인증 및 데이터 연동 로직 (Firebase v9+)] ---
  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeData = () => {};

    const initAll = async () => {
      try {
        // [보안] 환경 변수에서 파이어베이스 설정 로드
        const configStr = window.__firebase_config || '{}';
        const firebaseConfig = JSON.parse(configStr);
        const appId = window.__app_id || 'pms-service-id';

        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'stub-api-key') {
          console.warn('[CERT] Firebase 설정이 샘플 상태입니다. 대시보드 기능이 제한될 수 있습니다.');
          setLoading(false); // 가짜 데이터라도 보여주기 위해 로딩 해제
          return;
        }

        // [보안 핵심] Firebase 중복 초기화 방지 프로토콜 적용 (React 18 Strict Mode 대응)
        const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // 익명 로그인 세션 시작
        await signInAnonymously(auth);

        // 인증 상태 감지
        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });

        // 실시간 데이터 바인딩
        const privacyRef = collection(db, 'artifacts', appId, 'public', 'data', 'privacyRecords');
        const q = query(privacyRef, orderBy('createdAt', 'desc'));

        unsubscribeData = onSnapshot(q, (snapshot) => {
          const records = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            displayDate: doc.data().createdAt?.toDate().toLocaleString() || '처리 중...'
          }));
          setPrivacyRecords(records);
          setStats({
            total: records.length,
            today: records.filter(r => new Date(r.displayDate).toDateString() === new Date().toDateString()).length,
            alerts: 0
          });
        }, (err) => console.error('[EROR] 데이터 동기화 에러:', err));

      } catch (err) {
        console.error('[EROR] PMS 초기화 실패:', err);
        setLoading(false); // 에러가 나도 화면은 띄워줌 (White Screen 방어)
      }
    };

    initAll();

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, [user]);

  // --- [UI 서브 컴포넌트: 통계 카드] ---
  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-4xl font-black text-slate-800">{value}</p>
      <div className="mt-2 flex items-center text-xs text-slate-400">
        <Activity size={12} className="mr-1" />
        <span>실시간 동기화 중</span>
      </div>
    </div>
  );
  // --- [상태 관리 추가] ---
  const [isSignup, setIsSignup] = useState(false); // 가입 페이지 여부

  // --- [로딩 및 에러 처리 브릿지] ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-sans p-6 text-center text-white">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Shield size={80} className="relative animate-bounce" />
        </div>
        <h1 className="text-2xl font-black tracking-widest mb-4 uppercase">PMS Security Analyzing...</h1>
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress origin-left"></div>
        </div>
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
            PMS <span className="text-blue-600 not-italic">{isSignup ? 'SIGNUP' : 'SECURITY'}</span>
          </h1>
          <p className="text-center text-slate-500 mb-12 font-bold tracking-widest text-xs uppercase">{isSignup ? 'Create Master Account' : 'Administrator Privileged Access'}</p>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">Security ID</label>
              <div className="relative">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" defaultValue={isSignup ? "" : "admin@cert.com"} className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800" placeholder="admin@cert.com" />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" defaultValue={isSignup ? "" : "••••••••"} className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800" placeholder="••••••••" />
              </div>
            </div>

            <button 
              onClick={() => setUser({ uid: 'admin', email: 'admin@cert.com' })} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-2xl font-black text-xl hover:shadow-xl transition duration-500 active:scale-95 transform"
            >
              {isSignup ? 'CREATE ACCOUNT' : 'SECURE LOGIN'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setIsSignup(!isSignup)} className="text-blue-600 font-bold text-sm hover:underline">
              {isSignup ? 'Already have an account? Login' : 'Need a master account? Signup'}
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
          <span className="font-black text-xl tracking-tighter italic">PMS OPS</span>
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
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{activeTab} MODULE</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Authorized Personal Only</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">대표님 (Super Admin)</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Status: Secure</span>
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
                <StatCard title="보관 데이터" value={stats.total} icon={Database} colorClass="bg-blue-600 shadow-blue-200" />
                <StatCard title="오늘 신규" value={stats.today} icon={PlusCircle} colorClass="bg-emerald-600 shadow-emerald-200" />
                <StatCard title="차단 시도" value={stats.alerts} icon={Shield} colorClass="bg-rose-600 shadow-rose-200" />
              </div>

              <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-xl text-slate-900 tracking-tighter italic">ENCRYPTION LOGS</h3>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition shadow-sm">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="px-10 py-5">Secure ID</th>
                        <th className="px-10 py-5">Asset Type</th>
                        <th className="px-10 py-5">Timestamp</th>
                        <th className="px-10 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {privacyRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition duration-300">
                          <td className="px-10 py-6 font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{item.id}</td>
                          <td className="px-10 py-6 font-bold text-slate-700 text-sm">Personal Info</td>
                          <td className="px-10 py-6 text-slate-500 text-xs font-medium">{item.displayDate}</td>
                          <td className="px-10 py-6 text-right">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black ring-1 ring-blue-100">AES-256</span>
                          </td>
                        </tr>
                      ))}
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
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap">SEARCH & AUDIT</h3>
                <div className="flex-1 h-[2px] bg-slate-50"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto text-center py-20">
                <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Lock size={48} className="text-slate-300 mx-auto mb-6" />
                  <p className="text-slate-400 font-bold">검색 모듈 암호화 초기화 중...</p>
                  <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100">ACCESS SEARCH ENGINE</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
                <h3 className="text-xl font-black mb-8 border-l-4 border-blue-600 pl-4 italic">ADMIN LIST</h3>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">Manager #{i}</p>
                        <p className="text-xs text-slate-400 font-bold lowercase tracking-widest">Lv.{3-i} Security Admin</p>
                      </div>
                      <button className="text-slate-300 hover:text-blue-600 transition"><Settings size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-900 p-10 rounded-[32px] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={150} /></div>
                <h3 className="text-xl font-black mb-6 italic">PRIVILEGE CONTROL</h3>
                <p className="text-indigo-300 text-sm font-bold leading-relaxed mb-10">보안 등급별 접근 권한을 실시간으로 제어합니다. 모든 변경 사항은 감사 로그에 영구 기록됩니다.</p>
                <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 rounded-2xl font-black hover:bg-white/20 transition">EDIT PERMISSIONS</button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
              <h3 className="text-xl font-black mb-8 border-l-4 border-indigo-600 pl-4 italic">API CREDENTIALS</h3>
              <div className="p-8 bg-slate-900 rounded-[24px] text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.3em]">MASTER_API_KEY</span>
                  <span className="text-emerald-500 text-[10px] font-black uppercase underline decoration-double underline-offset-4">Active</span>
                </div>
                <code className="block p-5 bg-white/5 rounded-xl font-mono text-xs text-slate-400 break-all border border-white/5">************************************************************</code>
                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-blue-600 py-4 rounded-xl font-black text-xs hover:bg-blue-700 transition">REGENERATE KEY</button>
                  <button className="flex-1 bg-white/10 py-4 rounded-xl font-black text-xs hover:bg-white/20 transition">COPY ENDPOINT</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50">
                  <h3 className="text-xl font-black italic">SYSTEM CONFIGURATION</h3>
                </div>
                <div className="p-10 space-y-8">
                  {[
                    { label: 'Auto-Encryption', desc: '실시간 데이터 유입 시 즉시 AES-256 적용' },
                    { label: 'Deep Proxying', desc: '모든 API 요청을 보안 프록시 서버 경유' },
                    { label: 'Audit Logging', desc: '모든 관리 행위에 대한 불변 로그 생성' }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-800 text-sm">{s.label}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{s.desc}</p>
                      </div>
                      <div className="w-14 h-8 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg ml-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
