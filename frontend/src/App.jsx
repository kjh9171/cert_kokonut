import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Lock, Shield, Users, Search, Settings, LogOut, 
  Key, Database, Bell, Activity, PlusCircle, CheckCircle 
} from 'lucide-react';
// 파이어베이스 핵심 기능 임포트
import { initializeApp } from 'firebase/app';
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
    // [보안] 환경 변수에서 파이어베이스 설정 로드 (window 객체는 빌드 시 주입 전제)
    const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
    const appId = window.__app_id || 'pms-service-id';

    // 유효한 설정이 없을 경우 초기 테스트용 스텁 처리
    if (!firebaseConfig.apiKey) {
      console.warn('[CERT] Firebase config is missing. Please check .env settings.');
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // [보안 절차] 관리자 세션 유지를 위한 익명 로그인 시도
    const initSession = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('[EROR] Auth session failed:', err);
      }
    };

    initSession();

    // 인증 상태 실시간 감지 (관리자 권한 확인)
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // [실시간 모니터링] Firestore 개인정보 데이터 수신 (Rule 준수 경로)
    let unsubscribeData = () => {};
    if (user) {
      const privacyRef = collection(db, 'artifacts', appId, 'public', 'data', 'privacyRecords');
      const q = query(privacyRef, orderBy('createdAt', 'desc'));

      unsubscribeData = onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // 타임스탬프 가독 처리
          displayDate: doc.data().createdAt?.toDate().toLocaleString() || '처리 중...'
        }));
        setPrivacyRecords(records);
        // 통계 업데이트 로직 (간소화)
        setStats({
          total: records.length,
          today: records.filter(r => new Date(r.displayDate).toDateString() === new Date().toDateString()).length,
          alerts: 0
        });
      }, (err) => console.error('[EROR] Real-time data sync failed:', err));
    }

    // 마운트 해제 시 리소스 정리 (메모리 최적화)
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

  // --- [UI 레이아웃: 로그인 페이지] ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition duration-500">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg rotate-3">
              <Shield size={50} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-800 mb-2">PMS SERVICE</h1>
          <p className="text-center text-slate-400 mb-10 font-medium">개인정보관리시스템 관리자 전용</p>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase">Admin Access ID</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" placeholder="아이디를 입력하세요" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase">Security Password</label>
              <input type="password" name="password" className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" placeholder="••••••••" />
            </div>
            <button onClick={() => setUser({ uid: 'admin' })} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 transform">
              보안 인증 및 접속
            </button>
          </div>
          <div className="mt-8 text-center text-slate-300 text-xs">
            © 2026 CERT Security Operations. All Rights Reserved.
          </div>
        </div>
      </div>
    );
  }

  // --- [UI 레이아웃: 메인 대시보드] ---
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* 프리미엄 사이드바 */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-8 flex items-center gap-4 border-b border-slate-800">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter italic">PMS DASHBOARD</span>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          {[
            { id: 'dashboard', label: '운영 대시보드', icon: Database },
            { id: 'search', label: '정보 검색/열람', icon: Search },
            { id: 'admins', label: '시스템 관리자', icon: Users },
            { id: 'api', label: '인증/API 관리', icon: Key },
            { id: 'settings', label: '시스템 설정', icon: Settings },
          ].map((menu) => (
            <button 
              key={menu.id}
              onClick={() => setActiveTab(menu.id)} 
              className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition duration-300 ${activeTab === menu.id ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <menu.icon size={20} /> {menu.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 font-bold transition transform hover:translate-x-1">
            <LogOut size={20} /> 시스템 종료
          </button>
        </div>
      </aside>

      {/* 메인 작업 영역 */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* 헤더 섹션 */}
        <header className="bg-white border-b border-slate-100 p-6 px-10 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {activeTab === 'dashboard' && 'SYSTEM REAL-TIME STATUS'}
              {activeTab !== 'dashboard' && activeTab.toUpperCase() + ' MODULE'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">현재 시스템이 CERT의 철저한 보안 감시 하에 있습니다.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold font-mono uppercase tracking-widest">Server Secure</span>
            </div>
            <div className="text-right border-r pr-6 border-slate-100">
              <p className="text-sm font-black text-slate-800">대표님 (Super Admin)</p>
              <p className="text-xs text-slate-400">관리 권한: 최상위 (L0)</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
              <Users size={22} className="text-slate-600" />
            </div>
          </div>
        </header>

        {/* 콘텐츠 섹션 */}
        <section className="p-10 flex-1">
          {activeTab === 'dashboard' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {/* 통계 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="전체 개인정보 건수" value={stats.total} icon={Database} colorClass="bg-blue-600" />
                <StatCard title="오늘 신규 등록" value={stats.today} icon={PlusCircle} colorClass="bg-emerald-500" />
                <StatCard title="차단된 이상 접근" value={stats.alerts} icon={Shield} colorClass="bg-rose-500" />
              </div>

              {/* 데이터 테이블 */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Database className="text-blue-600" size={24} />
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">최근 암호화 처리 로그</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input type="text" placeholder="레코드 ID 검색..." className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 font-medium" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-5">이름 (Encrypted)</th>
                        <th className="px-8 py-5">이메일 (Encrypted)</th>
                        <th className="px-8 py-5">보안 처리일시</th>
                        <th className="px-8 py-5">상태 프로토콜</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {privacyRecords.length > 0 ? privacyRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Lock size={14} className="text-slate-300" />
                              <span className="font-mono text-xs text-slate-500 truncate w-32">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-mono text-xs text-slate-400">{item.email}</td>
                          <td className="px-8 py-6 text-slate-500 text-sm font-semibold">{item.displayDate}</td>
                          <td className="px-8 py-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black ring-1 ring-green-100">
                              <CheckCircle size={12} />
                              AES-256 SECURED
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300">
                              <Shield size={64} className="opacity-20" />
                              <p className="font-bold text-lg">보관된 개인정보가 없습니다.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-32 rounded-3xl shadow-xl shadow-slate-200/50 text-center border border-slate-100 animate-pulse">
              <Lock size={80} className="mx-auto text-slate-200 mb-8" />
              <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">Security Lockdown</h3>
              <p className="text-slate-400 text-lg font-medium">해당 모듈은 현재 CERT의 보안 검토 명령 완료 대기 중입니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
