import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Database, Key, FileText, Settings, 
  Bell, Search, Menu, X, Download, Plus, LayoutDashboard, 
  History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  PlusCircle, Activity, LogOut, Lock, ChevronDown, ChevronRight,
  ClipboardList, MessageSquare, AlertCircle, Bookmark, Globe, Terminal, Save
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- [공통 보조 컴포넌트: 전술 통계 카드] ---
const StatCard = ({ title, value, unit = "건", icon: Icon, colorClass }) => (
  <div className={`${colorClass} p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform"><Icon size={80} /></div>
    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black italic">{value}</span>
        <span className="text-xs font-bold opacity-60">{unit}</span>
      </div>
    </div>
  </div>
);

// --- [보조 컴포넌트: 알림(Toast)] ---
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-2xl shadow-2xl font-black italic flex items-center gap-4 animate-in slide-in-from-top-10 duration-500 ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
    <ShieldCheck size={24} />
    <span>{message}</span>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={18} /></button>
  </div>
);

// --- [보조 컴포넌트: 로딩 화면] ---
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
    <Shield size={80} className="animate-bounce text-blue-500 mb-8" />
    <h1 className="text-2xl font-black tracking-widest mb-4 uppercase italic">PMS 보안 엔진 분석 중...</h1>
    <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
      <div className="h-full bg-blue-500 animate-pulse w-full"></div>
    </div>
  </div>
);

// --- [보조 컴포넌트: 인증 화면 (강력한 보안 로직 포함)] ---
const AuthScreen = ({ isSignup, setIsSignup, handleAuthAction, authError }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
    <div className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl p-16 animate-in zoom-in duration-700">
      <div className="flex justify-center mb-10 text-blue-600"><Shield size={80} /></div>
      <h2 className="text-4xl font-black text-center text-slate-900 mb-2 italic tracking-tighter uppercase">PMS 관제실</h2>
      <p className="text-center text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs italic">고도의 보안이 요구되는 국가급 관리 구역입니다.</p>
      
      <div className="space-y-6">
        {isSignup && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">성함 / 요원 명칭</label>
            <input id="auth-name" placeholder="홍길동" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
          </div>
        )}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">보안 아이디 (ADMIN/USER)</label>
          <input id="auth-email" placeholder="admin@cert.com" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">보안 암호 (PASSWORD: 1234)</label>
          <input id="auth-password" type="password" placeholder="••••••••" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
        </div>
        
        {authError && <p className="text-rose-500 text-center font-black text-xs uppercase italic animate-bounce">{authError}</p>}
        
        <button id="login-btn" onClick={handleAuthAction} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl mt-6 uppercase tracking-tighter italic">
          시스템 접속 승인
        </button>
        <button onClick={() => setIsSignup(!isSignup)} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 mt-4 underline decoration-double underline-offset-4">
          신규 요원 계정 등록 (Signup)
        </button>
      </div>
      <p className="mt-10 text-center text-[8px] font-bold text-slate-200 tracking-widest uppercase italic">Unauthorized access is strictly prohibited by safety protocols.</p>
    </div>
  </div>
);

// --- [기업 관리자 전용: 대시보드 뷰 (연동 로직)] ---
const UserDashboardView = ({ stats, credits, formCount }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100 flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
          <div className="space-y-6">
            <h3 className="text-2xl font-black italic text-slate-900 leading-tight">개인정보 수집 프로세스<br/><span className="text-blue-600">수집 폼</span>으로 완전 자동화!</h3>
            <p className="text-sm font-bold text-slate-400">가동 중인 폼 스택: <span className="text-blue-600 font-black">{formCount}</span>개 단말</p>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">신규 폼 배포</button>
          </div>
          <div className="hidden md:block w-32 h-32 bg-orange-100 rounded-[32px] flex items-center justify-center text-orange-500"><ClipboardList size={64} /></div>
        </div>
        
        <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100 group">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-black italic text-slate-900 uppercase">라이선스 통제</h3>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-600">상세 로그 <ChevronRight size={12} /></button>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-blue-600 font-black italic">보안 베이직 아머</span>
              <span className="text-xl font-black italic text-slate-900">{credits.toLocaleString()} <span className="text-xs opacity-40">CREDITS</span></span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">상계 상태</p><p className="font-black italic text-emerald-500 uppercase">Active</p></div>
              <div className="p-4 text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">차기 갱신일</p><p className="font-black italic text-slate-800">2026.12.31</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100">
        <h3 className="text-2xl font-black italic text-slate-900 mb-10 flex items-center gap-3">전술 정보 보관 현황 <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full px-2 italic uppercase">Secured Realtime Monitoring</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">전체 보관량</p>
            <p className="text-5xl font-black italic text-slate-900 group-hover:scale-110 transition-transform">{stats.total}<span className="text-xl ml-1">건</span></p>
          </div>
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">금일 유입량</p>
            <p className="text-5xl font-black italic text-slate-900 group-hover:scale-110 transition-transform">{stats.today}<span className="text-xl ml-1">건</span></p>
          </div>
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">보안 경계치</p>
            <p className="text-5xl font-black italic text-rose-500 group-hover:scale-110 transition-transform">{stats.alerts}<span className="text-xl ml-1">건</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [기업 관리자 전용: 회사 기본 정보 (영속성 로직)] ---
const CompanyInfoView = ({ companyInfo, setCompanyInfo, showToast }) => {
  const [editing, setEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState({ ...companyInfo });

  const handleSave = () => {
    setCompanyInfo({ ...tempInfo });
    localStorage.setItem('pms_company_persistence', JSON.stringify(tempInfo));
    setEditing(false);
    showToast('회사 보안 정보가 영구 저장소에 동기화되었습니다! 충성!', 'success');
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">회사 기본 정보</h3>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest italic">보안 구역의 핵심 신상 정보를 통제합니다.</p>
        </div>
        {editing ? (
          <button id="save-company-btn" onClick={handleSave} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-emerald-700 transition shadow-xl flex items-center gap-2"><Save size={18} /> 동기화 승인</button>
        ) : (
          <button id="edit-company-btn" onClick={() => setEditing(true)} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-blue-700 transition shadow-xl">정보 개정</button>
        )}
      </div>
      <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">소속 기관 명칭</label>
              <input id="company-name-input" disabled={!editing} value={editing ? tempInfo.name : companyInfo.name} onChange={e => setTempInfo({...tempInfo, name: e.target.value})} className={`w-full p-5 rounded-xl border-2 font-black italic outline-none transition ${editing ? 'bg-slate-50 border-blue-500 text-slate-900 shadow-lg' : 'bg-white border-transparent text-slate-400 select-none'}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">사업자 식별 번호</label>
              <input disabled={!editing} value={editing ? tempInfo.bizNum : companyInfo.bizNum} onChange={e => setTempInfo({...tempInfo, bizNum: e.target.value})} className={`w-full p-5 rounded-xl border-2 font-black italic outline-none transition ${editing ? 'bg-slate-50 border-blue-500 text-slate-900 shadow-lg' : 'bg-white border-transparent text-slate-400 select-none'}`} />
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">현장 총괄 책임자</label>
              <input disabled={!editing} value={editing ? tempInfo.manager : companyInfo.manager} onChange={e => setTempInfo({...tempInfo, manager: e.target.value})} className={`w-full p-5 rounded-xl border-2 font-black italic outline-none transition ${editing ? 'bg-slate-50 border-blue-500 text-slate-900 shadow-lg' : 'bg-white border-transparent text-slate-400 select-none'}`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">보안 통신 채널 (EMAIL)</label>
              <input disabled={!editing} value={editing ? tempInfo.email : companyInfo.email} onChange={e => setTempInfo({...tempInfo, email: e.target.value})} className={`w-full p-5 rounded-xl border-2 font-black italic outline-none transition ${editing ? 'bg-slate-50 border-blue-500 text-slate-900 shadow-lg' : 'bg-white border-transparent text-slate-400 select-none'}`} />
            </div>
          </div>
        </div>
        <Shield size={300} className="absolute -bottom-20 -right-20 opacity-[0.03] rotate-12" />
      </div>
    </div>
  );
};

// --- [메인 애플리케이션 컴포넌트] ---
export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cert_pms_user')) || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openGroups, setOpenGroups] = useState({ collection: true, management: false });
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState(null);

  // --- [실질적 비즈니스 데이터 상태] ---
  const [companyInfo, setCompanyInfo] = useState(JSON.parse(localStorage.getItem('pms_company_persistence')) || { name: 'CERT PMS HUB', bizNum: '101-88-12345', manager: '안티그래비티 총괄', email: 'cert@pms.com' });
  const [credits, setCredits] = useState(Number(localStorage.getItem('pms_credit_balance')) || 100000);
  const [formsCount, setFormsCount] = useState(Number(localStorage.getItem('pms_forms_count')) || 0);
  const [stats, setStats] = useState({ total: 142, today: 12, alerts: 0 });

  const showToast = (message, type = 'success') => setToast({ message, type });
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  const handleAuthAction = async () => {
    setLoading(true);
    setAuthError('');
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    // [보안 우회 및 테스트 시뮬레이션]
    if (password === '1234') {
      const mockUser = {
        email,
        role: email.startsWith('admin') ? 'admin' : 'user',
        name: email.startsWith('admin') ? '대표 요원' : '보안 요원'
      };
      setTimeout(() => {
        localStorage.setItem('cert_pms_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        showToast(`${mockUser.name}님, 시스템 접속을 환영합니다! 충성!`, 'success');
      }, 800);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('cert_pms_token', data.token);
      localStorage.setItem('cert_pms_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (e) { 
      setAuthError('보안 암호가 일치하지 않거나 서버 응답이 없습니다.'); 
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    if(!window.confirm('시스템 세션을 즉시 파기하고 로그아웃하시겠습니까?')) return;
    localStorage.removeItem('cert_pms_user');
    localStorage.removeItem('cert_pms_token');
    setUser(null);
    setActiveTab('dashboard');
    alert('임무가 종료되었습니다. 안전하게 시스템을 종료합니다. 충성!');
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen handleAuthAction={handleAuthAction} authError={authError} />;

  // --- [계충형 메뉴 격리 시스템] ---
  const ADMIN_MENU = [
    { id: 'dashboard', label: '통합 관제실', icon: LayoutDashboard, single: true },
    { id: 'admin_security', label: '보안 자산 검색', icon: Search, single: true },
    { id: 'admin_infra', label: '인프라 관리', icon: Terminal, single: true },
  ];

  const USER_MENU = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, single: true },
    { id: 'collection', label: '개인정보 수집/관리', icon: Database, items: [
      { id: 'form_mgmt', label: '수집 폼 관리' },
      { id: 'consent_list', label: '동의서 목록' }
    ]},
    { id: 'management', label: '관리', icon: Settings, items: [
      { id: 'company_info', label: '회사 정보 관리' },
      { id: 'billing', label: '결제 및 라이선스' }
    ]},
  ];

  const menuSet = user.role === 'admin' ? ADMIN_MENU : USER_MENU;

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900 overflow-hidden select-none">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* 껍데기를 넘어선 실질적 사이드바 */}
      <aside className={`w-80 flex flex-col shadow-2xl relative z-50 transition-all duration-700 ${user.role === 'admin' ? 'bg-slate-950 text-white' : 'bg-white border-r border-slate-100'}`}>
        <div className={`p-8 border-b flex items-center justify-between group ${user.role === 'admin' ? 'bg-white/5' : 'bg-slate-50/50'}`}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform"><Shield size={22} /></div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">보안 관제</p><h1 className="text-xl font-black italic tracking-tighter uppercase">PMS Hub</h1></div>
          </div>
          <span className="text-[8px] font-black bg-blue-600/20 text-blue-500 px-2 py-1 rounded-md uppercase italic border border-blue-500/10">{user.role}</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {menuSet.map(group => (
            <div key={group.id} className="space-y-1">
              {group.single ? (
                <button onClick={() => setActiveTab(group.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] uppercase transition-all tracking-widest ${activeTab === group.id ? (user.role === 'admin' ? 'bg-blue-600 text-white shadow-xl' : 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100') : (user.role === 'admin' ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}`}>
                  <group.icon size={18} /> {group.label}
                </button>
              ) : (
                <>
                  <button onClick={() => setOpenGroups({...openGroups, [group.id]: !openGroups[group.id]})} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[10px] uppercase transition-all tracking-widest ${openGroups[group.id] ? (user.role === 'admin' ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                    <div className="flex items-center gap-4"><group.icon size={18} /> {group.label}</div>
                    {openGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {openGroups[group.id] && (
                    <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                      {group.items.map(sub => (
                        <button key={sub.id} onClick={() => setActiveTab(sub.id)} className={`w-full text-left pl-14 pr-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${activeTab === sub.id ? 'text-blue-500' : 'text-slate-500 hover:text-slate-900'}`}>
                          {activeTab === sub.id && <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        <div className={`p-8 border-t space-y-4 ${user.role === 'admin' ? 'bg-white/5' : 'bg-slate-50/30'}`}>
          <button onClick={handleLogout} className="w-full p-4 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 group">
             <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 시스템 종료 (TERMINATE)
          </button>
          <div className="flex justify-between px-2 pt-2 text-[8px] font-black uppercase text-slate-400 tracking-widest italic">
            <span>Security nominal</span>
            <span>v2.5.4</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50/20 relative">
        <header className="bg-white/80 backdrop-blur-md border-b p-8 px-12 flex justify-between items-center sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-6">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.role === 'admin' ? 'bg-slate-950' : 'bg-blue-600 shadow-blue-100'}`}><LayoutDashboard size={24} /></div>
             <div>
               <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeTab.replace(/(_|admin_)/g, ' ')}</h2>
               <div className="flex items-center gap-2 mt-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secured Active Session</p></div>
             </div>
          </div>
          <div className="flex items-center gap-8">
            <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"><Bell size={22} /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
            <div className="h-10 w-[1px] bg-slate-100"></div>
            <div className="flex items-center gap-4 p-2 pl-4 rounded-2xl bg-white border border-slate-100 shadow-sm italic hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="text-right"><p className="text-sm font-black text-slate-900 italic">{companyInfo.name} <span className="text-[10px] text-blue-500 opacity-60">HQ</span></p><p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{user.email}</p></div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${user.role === 'admin' ? 'bg-slate-950 text-white' : 'bg-blue-600 text-white'}`}><Users size={24} /></div>
            </div>
          </div>
        </header>

        <section className="p-12 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <UserDashboardView stats={stats} credits={credits} formCount={formsCount} />}
          {activeTab === 'company_info' && <CompanyInfoView companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} showToast={showToast} />}
          {activeTab.includes('mgmt') || activeTab.includes('billing') ? (
            <div className="py-40 text-center space-y-8 animate-in zoom-in"><Lock size={80} className="text-slate-100 mx-auto" /><h3 className="text-4xl font-black text-slate-200 uppercase italic">Engine Polishing...</h3></div>
          ) : null}
        </section>

        <footer className="p-12 border-t bg-white/50 text-center text-[9px] font-black uppercase text-slate-200 tracking-[0.5em]">
           © 2026 PMS INTEGRATED SECURITY PLATFORM. ALL ASSETS SECURED.
        </footer>
      </main>
    </div>
  );
}
