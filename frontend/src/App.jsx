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
  Smartphone, EyeOff, Share2, Clock, ExternalLink, Scale, Info, FileSearch, Save, Trash2, RefreshCw, UserCheck, Edit3
} from 'lucide-react';
// 데이터 시각화 라이브러리 (보안 관제용)
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- 전역 상수 및 설정 ---

const COMPANY_MENU = [
  { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard },
  { id: 'member_db', label: '회원 DB 관리', icon: Database },
  { id: 'user_manage', label: '이용자 계정 관리', icon: Users },
  { id: 'security_vault', label: '보안 금고 (암/복호화)', icon: Lock },
  { id: 'policy_manage', label: '약관/처리방침 관리', icon: Scale },
  { id: 'subscription', label: '구독 서비스 관리', icon: CreditCard },
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
      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">세션 잔여 시간</span>
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
        <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-600 px-4 hover:text-blue-600 transition">보안 로그인</button>
        <button onClick={() => onNavigate('signup')} className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">무료 시작하기</button>
      </div>
    </nav>

    <main className="pt-40 text-center px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-8 uppercase">
          <Zap size={14} fill="currentColor" /> 보안 및 신뢰 최우선 (Secured by CERT)
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
          개인정보 보호,<br /><span className="text-blue-600">자동화</span>의 시대입니다.
        </h1>
        <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
          복잡한 보안 컴플라이언스 대응부터 데이터 암호화 보관까지,<br />
          기업의 보안 리스크를 단 하나의 플랫폼으로 해결하세요.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => onNavigate('signup')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">지금 바로 도입하기</button>
        </div>
      </div>
      
      <div className="mt-24 max-w-6xl mx-auto px-4">
        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6">
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner">
                <FileSearch size={24} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">지능형 개인정보 관리 시스템</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                PMS Center를 통해 모든 데이터가 실시간으로 분류되고 법적 권고 사항에 맞춰 자동 암호화되는 과정을 확인하세요. 단 하나의 플랫폼으로 모든 리스크를 통제합니다.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 transform hover:scale-105 transition duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100">
                  <CheckCircle size={18} /> 개인정보처리방침 v2.4 자동 업데이트 완료
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100">
                  <Lock size={18} /> 모든 필드 AES-256 암호화 적용 중
                </div>
                <div className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-100">
                  <Activity size={18} /> 실시간 컴플라이언스 모니터링 활성화
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer className="mt-40 py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-8 opacity-50">
          <Shield size={24} className="text-slate-900" />
          <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">PMS 센터</span>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">
          <span className="cursor-pointer hover:text-blue-600 transition">개인정보처리방침</span>
          <span className="cursor-pointer hover:text-blue-600 transition">서비스 이용약관</span>
          <span className="cursor-pointer hover:text-blue-600 transition">쿠키정책</span>
        </div>
        <div className="space-y-2">
          <p className="text-slate-400 text-[10px] font-bold uppercase">주식회사 개인정보관리서비스 | 대표이사: 대표님 | 사업자번호: 000-00-00000</p>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.1em]">© 2026 PMS CENTER INC. SECURED BY CERT TEAM. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  </div>
);

const CompanyAdminView = ({ 
  activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout, onNavigate,
  dashStats, memberRecords, memberLoading, handleDeleteRecord, onVaultComplete 
}) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('pms_token')}`,
        ...(options.headers || {})
      },
    }), []);

  const loadAuditLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await authFetch('/api/admin/logs');
      if (res.ok) setAuditLogs(await res.json());
    } catch { }
    finally { setLogsLoading(false); }
  }, [authFetch]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      // 백엔드 API에서 pms_users 목록 조회 (가정)
      const res = await authFetch('/api/admin/admins'); // 관리자/이용자 통합 관리
      if (res.ok) setUsers(await res.json());
    } catch { }
    finally { setUsersLoading(false); }
  }, [authFetch]);

  useEffect(() => {
    if (activeTab === 'dashboard') loadAuditLogs();
    if (activeTab === 'user_manage') loadUsers();
  }, [activeTab, loadAuditLogs, loadUsers]);

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
                { l: '정보 활용 동의율', v: (dashStats.consentRate || 98) + '%', c: 'text-emerald-600', i: ShieldCheck },
                { l: '금일 보안 활동', v: String(dashStats.today || 0), c: 'text-indigo-600', i: Activity },
                { l: '라이선스 상태', v: '유효', c: 'text-amber-600', i: CreditCard },
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
                <History size={20} className="text-blue-600" /> 최근 보안 활동 로그
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-bold border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4">처리 일시</th><th className="py-4 px-4">담당자</th><th className="py-4 px-4">작업</th><th className="py-4 px-4">대상</th><th className="py-4 px-4">수행 사유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400 italic">기록된 보안 활동이 없습니다.</td></tr>
                    ) : auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-slate-400 tabular-nums">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                        <td className="py-4 px-4 text-slate-700">{log.userName}</td>
                        <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black ${log.action === 'ENCRYPT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.action === 'ENCRYPT' ? '암호화' : '복호화'}</span></td>
                        <td className="py-4 px-4 text-slate-600 italic font-medium">{log.target}</td>
                        <td className="py-4 px-4 text-slate-500 font-medium max-w-xs truncate">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'user_manage':
        return (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">이용자 계정 관리</h2>
              <button onClick={() => alert('계정 추가 기능은 현재 보안 정책 검토 중입니다. (v2.1 예정)')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition shadow-lg shadow-slate-200 uppercase italic"><Plus size={16} /> 이용자 계정 신규 생성</button>
            </div>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-6">성명</th><th className="py-4 px-6">이메일</th><th className="py-4 px-6">권한</th><th className="py-4 px-6">등록일시</th><th className="py-4 px-6 text-right">제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-bold">
                    {usersLoading ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400">데이터 로드 중...</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-5 px-6 italic uppercase">{u.name}</td>
                        <td className="py-5 px-6 font-medium text-slate-500">{u.email}</td>
                        <td className="py-5 px-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{u.role === 'admin' ? '관리자' : '일반이용자'}</span></td>
                        <td className="py-5 px-6 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300">
                          <Edit3 size={18} className="cursor-pointer hover:text-blue-600" />
                          <Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => {if(confirm('이 계정을 영구 삭제하시겠습니까?')) authFetch(`/api/admin/admins/${u.id}`, {method:'DELETE'}).then(()=>loadUsers());}} />
                        </td>
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
                <h3 className="text-2xl font-black text-slate-800 italic uppercase">고객 회원 자산 DB</h3>
                <button onClick={() => setActiveTab('security_vault')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase italic"><Plus size={16} /> 대량 보안 처리 (엑셀)</button>
              </div>
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse font-bold">
                  <thead>
                    <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-6">성명</th><th className="py-4 px-6">연락처</th><th className="py-4 px-6">보안 상태</th><th className="py-4 px-6 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {memberLoading ? <tr><td colSpan={4} className="py-10 text-center">로딩 중...</td></tr> : memberRecords.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-5 px-6 italic">{row.name}</td>
                        <td className="py-5 px-6 tabular-nums">{row.phone || '***-****-****'}</td>
                        <td className="py-5 px-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${row.status === 'ENCRYPTED' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>{row.status === 'ENCRYPTED' ? '보안 암호화' : '평문 노출'}</span></td>
                        <td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300">
                          <Eye size={18} className="cursor-pointer hover:text-blue-600" />
                          <Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => handleDeleteRecord(row.id)} />
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
        return <div className="p-24 text-center font-black text-slate-400 uppercase italic">개발 중인 보안 모듈입니다.</div>;
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
              <div className="flex justify-end items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span><p className="text-[9px] text-emerald-500 font-bold uppercase">시스템 인증됨</p></div>
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
  const [dashStats, setDashStats] = useState({ total: 0, today: 0 });
  const [memberRecords, setMemberRecords] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  // 로그인/회원가입 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...(options.headers || {}) } }), [authToken]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if(!email || !password) { setError('정보를 모두 입력하세요.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '로그인 실패'); return; }
      if (data.token) {
        localStorage.setItem('pms_token', data.token);
        setAuthToken(data.token);
        setCurrentScreen('company_admin');
      }
    } catch { setError('서버 연결 실패'); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    if(!email || !password || !name) { setError('모든 항목을 입력하세요.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '가입 실패'); return; }
      alert('보안 계정이 생성되었습니다. 로그인을 진행하십시오.');
      setCurrentScreen('login');
    } catch { setError('서버 연결 실패'); }
    finally { setLoading(false); }
  };

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
    if (!data.records || data.records.length === 0) return;
    try {
      const res = await authFetch('/api/admin/records/batch', {
        method: 'POST',
        body: JSON.stringify({ records: data.records })
      });
      if (res.ok) {
        loadMemberRecords(); loadDashStats();
      }
    } catch { }
  };

  useEffect(() => {
    if (currentScreen === 'company_admin' && authToken) { loadDashStats(); loadMemberRecords(); }
  }, [currentScreen, authToken, loadDashStats, loadMemberRecords]);

  return (
    <div className="selection:bg-blue-600 selection:text-white no-scrollbar">
      {currentScreen === 'landing' && <LandingView onNavigate={(s)=>setCurrentScreen(s)} />}
      {currentScreen === 'login' && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-[440px] bg-white rounded-[4rem] shadow-2xl p-14 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => setCurrentScreen('landing')}>
              <div className="bg-blue-600 p-4 rounded-3xl text-white mb-5 shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500"><Shield size={32} /></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">보안 포털 접속</h2>
            </div>
            <div className="space-y-6">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="보안 이메일 주소" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" />
              {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
              <button onClick={handleLogin} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98] uppercase italic">{loading ? '인증 중...' : '접속 승인 요청'}</button>
              <p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600 transition" onClick={()=>setCurrentScreen('signup')}>신규 보안 계정 생성하기</p>
            </div>
          </div>
        </div>
      )}
      {currentScreen === 'signup' && (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-[480px] bg-white rounded-[4rem] shadow-2xl p-16 border border-slate-100 relative">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12 text-center italic">시스템 초기화</h2>
            <div className="space-y-6">
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="담당자 성명" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" />
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소 (@cert.com 권장)" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호 설정" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" />
              {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
              <button onClick={handleSignup} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-[0.98] uppercase italic">{loading ? '계정 생성 중...' : '보안 워크스페이스 생성'}</button>
              <p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600 transition mt-6" onClick={()=>setCurrentScreen('login')}>이미 계정이 있습니까? 로그인</p>
            </div>
          </div>
        </div>
      )}
      {currentScreen === 'company_admin' && (
        <CompanyAdminView 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
          onLogout={() => { localStorage.removeItem('pms_token'); setAuthToken(''); setCurrentScreen('login'); }} onNavigate={(s)=>setCurrentScreen(s)}
          dashStats={dashStats} memberRecords={memberRecords} memberLoading={memberLoading}
          handleDeleteRecord={(id) => { if(confirm('영구 파기하시겠습니까?')) authFetch(`/api/admin/records/${id}`, {method:'DELETE'}).then(()=>loadMemberRecords()); }}
          onVaultComplete={handleVaultComplete}
        />
      )}
      <style>{`body { font-family: 'Noto Sans KR', sans-serif; overflow-x: hidden; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
