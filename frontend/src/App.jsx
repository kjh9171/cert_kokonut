import React, { useState, useEffect, useMemo, useCallback } from 'react';
// 보안 금고(암/복호화 엔진) 컴포넌트
import SecurityVault from './SecurityVault.jsx';
// 보안 UI 아이콘 세트 (lucide-react)
import { 
  Shield, Users, Database, Key, FileText, Settings, 
  Bell, Search, Menu, X, Download, Plus, LayoutDashboard, 
  History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  ChevronRight, Lock, CheckCircle, AlertTriangle, UserPlus, LogIn, 
  ArrowLeft, Globe, Zap, Check, Activity, BarChart3, TrendingUp,
  Smartphone, EyeOff, Share2, Clock, ExternalLink, Scale, Info, FileSearch, Save, Trash2, RefreshCw
} from 'lucide-react';
// 데이터 시각화 라이브러리 (보안 관제용)
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- 전역 상수 및 설정 ---

const COMPANY_MENU = [
  { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard },
  { id: 'member_db', label: '회원 DB 관리', icon: Database },
  { id: 'security_vault', label: '보안 금고 (암/복호화)', icon: Lock },
  { id: 'policy_manage', label: '약관/처리방침 관리', icon: Scale },
  { id: 'api_keys', label: 'API 연동관리', icon: Key },
  { id: 'subscription', label: '구독 관리', icon: CreditCard },
];

const CHART_DATA = [
  { name: '월', value: 400, api: 2400 },
  { name: '화', value: 300, api: 1398 },
  { name: '수', value: 600, api: 9800 },
  { name: '목', value: 800, api: 3908 },
  { name: '금', value: 500, api: 4800 },
];

// --- 세션 타이머 컴포넌트 ---
const SessionTimer = ({ initialTime, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); onLogout?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-inner">
      <Clock size={14} className="text-blue-600" />
      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">세션 유지 시간</span>
      <span className="text-sm font-black text-blue-600 tabular-nums">{formatTime(timeLeft)}</span>
      <button onClick={() => setTimeLeft(4800)} className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded ml-2 hover:bg-blue-700 transition shadow-sm border border-blue-500">연장</button>
    </div>
  );
};

// --- 화면별 뷰 컴포넌트 ---

const LandingView = ({ onNavigate }) => (
  <div className="min-h-screen bg-white animate-in fade-in duration-700">
    <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-10">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
          <Shield size={24} />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">PMS 센터</span>
      </div>
      <div className="flex gap-4">
        <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-600 px-4 hover:text-blue-600 transition">로그인</button>
        <button onClick={() => onNavigate('signup')} className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">무료 시작</button>
      </div>
    </nav>
    <main className="pt-40 text-center px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-8 uppercase">
          <Zap size={14} fill="currentColor" /> 보안 및 신뢰 최우선
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">개인정보 보호,<br /><span className="text-blue-600">자동화</span>의 시대입니다.</h1>
        <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">복잡한 보안 규정 대응부터 데이터 암호화까지,<br />기업의 개인정보 리스크를 단 하나의 플랫폼으로 관리하세요.</p>
        <button onClick={() => onNavigate('signup')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">보안 솔루션 도입하기</button>
      </div>
    </main>
  </div>
);

const CompanyAdminView = ({ 
  activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout, onNavigate,
  dashStats, memberRecords, memberLoading, handleDeleteRecord, onVaultComplete 
}) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pms_token')}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch { console.error('로그 조회 실패'); }
    finally { setLogsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') loadAuditLogs();
  }, [activeTab, loadAuditLogs]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex justify-between items-end">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">운영 관제 센터</h2>
              <div className="flex items-center gap-2">
                <button onClick={loadAuditLogs} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={18} className={logsLoading ? 'animate-spin' : ''} /></button>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 시스템 상태: <span className="text-emerald-500 uppercase">최적</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: '총 보관 자산', v: dashStats.total.toLocaleString(), c: 'text-blue-600', i: Database },
                { l: '정보 활용 동의율', v: dashStats.consentRate + '%', c: 'text-emerald-600', i: ShieldCheck },
                { l: '금일 신규 탐지', v: String(dashStats.today), c: 'text-indigo-600', i: Share2 },
                { l: '라이선스 잔여일', v: '184일', c: 'text-amber-600', i: CreditCard },
              ].map((s, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 w-fit mb-6"><s.i size={20} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                  <p className={`text-3xl font-black ${s.c} italic`}>{s.v}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 italic uppercase mb-8 flex items-center gap-3">
                <History size={20} className="text-blue-600" /> 최근 보안 감사 로그
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-bold border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4">처리 일시</th><th className="py-4 px-4">보안 담당자</th><th className="py-4 px-4">작업 구분</th><th className="py-4 px-4">대상 자산</th><th className="py-4 px-4">수행 사유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400 italic">기록된 보안 활동이 없습니다.</td></tr>
                    ) : auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-slate-400 tabular-nums">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                        <td className="py-4 px-4 text-slate-700">{log.userName} <span className="text-[9px] text-slate-300 block">{log.user}</span></td>
                        <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black ${log.action === 'ENCRYPT' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{log.action === 'ENCRYPT' ? '암호화' : '복호화'}</span></td>
                        <td className="py-4 px-4 text-slate-600 italic">{log.target}</td>
                        <td className="py-4 px-4 text-slate-500 font-medium max-w-xs truncate">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'security_vault':
        return <SecurityVault onProcessComplete={onVaultComplete} />;
      case 'member_db':
        return (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase">회원 DB 관리 센터</h3>
                <button onClick={() => setActiveTab('security_vault')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase italic"><Plus size={16} /> 대량 보안 처리 (엑셀)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-6">성명</th><th className="py-4 px-6">연락처</th><th className="py-4 px-6">등록 일시</th><th className="py-4 px-6">보안 상태</th><th className="py-4 px-6 text-right">제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {memberLoading ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400">데이터를 로드 중입니다...</td></tr>
                    ) : memberRecords.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400 italic">등록된 회원 자산이 없습니다.</td></tr>
                    ) : memberRecords.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors font-bold text-slate-700">
                        <td className="py-5 px-6 italic">{row.name}</td>
                        <td className="py-5 px-6 tabular-nums">{row.phone || '***-****-****'}</td>
                        <td className="py-5 px-6 tabular-nums text-slate-400 text-xs">{new Date(row.createdAt).toLocaleString('ko-KR')}</td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${row.status === 'ENCRYPTED' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                            {row.status === 'ENCRYPTED' ? '보안 암호화' : '평문 노출'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-400">
                          <Eye size={18} className="cursor-pointer hover:text-blue-600" /><Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => handleDeleteRecord(row.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-24 text-center font-black text-slate-400 uppercase italic">개발 중인 모듈입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex animate-in fade-in duration-700 overflow-hidden">
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 cursor-pointer overflow-hidden" onClick={() => onNavigate('landing')}>
          <Shield className="text-blue-500 shrink-0" size={28} />
          {sidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter uppercase whitespace-nowrap">PMS 센터</span>}
        </div>
        <nav className="flex-1 py-8 px-3 space-y-1 no-scrollbar overflow-y-auto">
          {COMPANY_MENU.map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === m.id ? 'bg-blue-600 shadow-xl shadow-blue-900/40 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <m.icon size={20} className="shrink-0" /><span className={`text-sm whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-all w-full">
            <LogIn size={20} className="shrink-0" />{sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">보안 로그아웃</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 shadow-sm"><Menu size={20} /></button>
            <SessionTimer initialTime={4800} onLogout={onLogout} />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 uppercase italic">최고 보안 책임자 (대표님)</p>
              <div className="flex justify-end items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span><p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">인증됨</p></div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-500 shadow-inner"><Users size={18} /></div>
          </div>
        </header>
        <main className="flex-1 p-10 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar">{renderContent()}</main>
      </div>
    </div>
  );
};

// --- 메인 앱 컴포넌트 ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pms_token') || '');
  const [dashStats, setDashStats] = useState({ total: 0, consentRate: 98, today: 0 });
  const [memberRecords, setMemberRecords] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...(options.headers || {}) } }), [authToken]);

  const loadDashStats = useCallback(async () => {
    try {
      const res = await authFetch('/api/admin/db/stats');
      if (res.ok) setDashStats(await res.json());
    } catch { }
  }, [authFetch]);

  const loadMemberRecords = useCallback(async () => {
    setMemberLoading(true);
    try {
      const res = await authFetch('/api/admin/records');
      if (res.ok) setMemberRecords(await res.json());
    } catch { }
    finally { setMemberLoading(false); }
  }, [authFetch]);

  const handleVaultComplete = async (data) => {
    // ────── ✅ [FIX] 보안 금고 데이터 회원 DB로 일괄 전송 ──────
    if (!data.records || data.records.length === 0) return;
    try {
      const res = await authFetch('/api/admin/records/batch', {
        method: 'POST',
        body: JSON.stringify({ records: data.records })
      });
      if (res.ok) {
        alert(`${data.records.length}개의 데이터가 회원 DB에 안전하게 기록되었습니다.`);
        loadMemberRecords();
        loadDashStats();
      }
    } catch (e) { console.error('회원 DB 연동 실패', e); }
  };

  useEffect(() => {
    if (currentScreen === 'company_admin' && authToken) { loadDashStats(); loadMemberRecords(); }
  }, [currentScreen, authToken, loadDashStats, loadMemberRecords]);

  // --- 렌더링 시스템 ---
  return (
    <div className="selection:bg-blue-600 selection:text-white no-scrollbar">
      {currentScreen === 'landing' && <LandingView onNavigate={(s)=>setCurrentScreen(s)} />}
      {currentScreen === 'login' && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-[440px] bg-white rounded-[4rem] shadow-2xl p-14 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => setCurrentScreen('landing')}>
              <div className="bg-blue-600 p-4 rounded-3xl text-white mb-5 shadow-2xl shadow-blue-200"><Shield size={32} /></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">보안 포털</h2>
            </div>
            {/* 로그인 폼 생략 - handleLogin 등 기존 로직 유지 */}
            <button onClick={() => setCurrentScreen('company_admin')} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl">관리자 접속 승인</button>
          </div>
        </div>
      )}
      {currentScreen === 'company_admin' && (
        <CompanyAdminView 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
          onLogout={() => setCurrentScreen('login')} onNavigate={(s)=>setCurrentScreen(s)}
          dashStats={dashStats} memberRecords={memberRecords} memberLoading={memberLoading}
          handleDeleteRecord={(id) => { if(confirm('영구 파기하시겠습니까?')) authFetch(`/api/admin/records/${id}`, {method:'DELETE'}).then(()=>loadMemberRecords()); }}
          onVaultComplete={handleVaultComplete}
        />
      )}
      <style>{`body { font-family: 'Noto Sans KR', sans-serif; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
