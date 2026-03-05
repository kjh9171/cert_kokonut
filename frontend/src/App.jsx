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
  Smartphone, EyeOff, Share2, Clock, ExternalLink, Scale, Info, FileSearch, Save, Trash2, RefreshCw, UserCheck, Edit3, Send, User, ChevronLeft, QrCode, Sparkles, Wand2, MessageSquare, Calendar, FileDown, CreditCard as CardIcon, Save as SaveIcon
} from 'lucide-react';
// 데이터 시각화 라이브러리 (보안 관제용)
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- 전역 상수 및 설정 ---

const COMPANY_MENU = [
  { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard },
  { id: 'member_db', label: '회원 DB 관리', icon: Database },
  { id: 'user_manage', label: '이용자 계정 관리', icon: Users, adminOnly: true },
  { id: 'security_vault', label: '보안 금고 (암/복호화)', icon: Lock },
  { id: 'policy_manage', label: '약관/처리방침 관리', icon: Scale },
  { id: 'subscription', label: '구독 관리', icon: Sparkles },
  { id: 'my_settings', label: '내 정보 관리', icon: User },
];

const ALL_PERMISSIONS = COMPANY_MENU.map(m => ({ id: m.id, label: m.label }));

// --- 세션 타이머 컴포넌트 ---
function SessionTimer({ initialTime, onLogout, onRefresh, isSandbox, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => { setTimeLeft(initialTime); }, [resetKey, initialTime]);

  useEffect(() => {
    if (isSandbox) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(interval); onLogout?.(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout, isSandbox]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  
  if (isSandbox) return <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-100 text-[10px] font-black animate-pulse whitespace-nowrap">무료 체험 모드 (저장 불가)</div>;

  return (
    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-inner whitespace-nowrap">
      <Clock size={14} className="text-blue-600" />
      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">보안 세션 만료</span>
      <span className={`text-sm font-black tabular-nums ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-blue-600'}`}>{formatTime(timeLeft)}</span>
      <button onClick={onRefresh} className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded ml-2 hover:bg-blue-700 transition shadow-sm border border-blue-500 uppercase">RENEW</button>
    </div>
  );
}

// --- 랜딩 페이지 뷰 ---
function LandingView({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-700 overflow-y-auto">
      <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200"><Shield size={24} /></div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">PMS 센터</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-600 px-4 hover:text-blue-600 transition">보안 로그인</button>
          <button onClick={() => onNavigate('sandbox')} className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">무료 시작하기</button>
        </div>
      </nav>

      <main className="pt-40 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-8 uppercase"><Zap size={14} fill="currentColor" /> 보안 및 신뢰 최우선 (Secured by CERT)</div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">개인정보 보호,<br /><span className="text-blue-600">자동화</span>의 시대입니다.</h1>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">복잡한 보안 컴플라이언스 대응부터 데이터 암호화 보관까지,<br />기업의 보안 리스크를 단 하나의 플랫폼으로 해결하세요.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => onNavigate('sandbox')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">무료 체험하기 (가입 없이)</button>
            <button onClick={() => onNavigate('sandbox')} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition shadow-2xl">지금 바로 도입하기 (체험)</button>
          </div>
        </div>
        <div className="mt-24 max-w-6xl mx-auto px-4 mb-20 text-left">
          <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"><FileSearch size={24} /></div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">지능형 개인정보 관리 시스템</h3>
              <p className="text-slate-500 font-medium leading-relaxed">PMS Center를 통해 모든 데이터가 실시간으로 분류되고 법적 권고 사항에 맞춰 자동 암호화되는 과정을 확인하세요. 단 하나의 플랫폼으로 모든 리스크를 통제합니다.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-4 transform hover:scale-105 transition duration-500">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100"><CheckCircle size={18} /> 개인정보처리방침 v2.4 자동 업데이트 완료</div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100"><Lock size={18} /> 모든 필드 AES-256 암호화 적용 중</div>
              <div className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-100"><Activity size={18} /> 실시간 컴플라이언스 모니터링 활성화</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="mt-20 py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-8 opacity-50"><Shield size={24} className="text-slate-900" /><span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">PMS 센터</span></div>
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-4">주식회사 개인정보관리서비스 | 대표이사: 김종환 | 사업자번호: 000-00-00000</p>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.1em]">© 2026 PMS CENTER INC. SECURED BY CERT TEAM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

// --- 접근 제한 및 구독 유도 뷰 ---
function RestrictedView({ title, message, onUpgrade }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-10 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-rose-100 animate-bounce">
        <Lock size={48} />
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">{title}</h3>
      <p className="text-slate-500 font-medium text-center mb-10 leading-relaxed max-w-md">{message}</p>
      <div className="flex gap-4">
        <button onClick={onUpgrade} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all flex items-center gap-3">
          <CreditCard size={20} /> 프리미엄 구독하기
        </button>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Secured by CERT Total Management</p>
    </div>
  );
}

// --- AI 에이전트 정책 관리 뷰 ---
function PolicyAIView({ authFetch }) {
  const [policy, setPolicy] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaveLoading] = useState(false);

  useEffect(() => {
    authFetch('/api/admin/policies').then(r => r.ok && r.json().then(d => setPolicy(d.content)));
  }, [authFetch]);

  const generateSample = () => {
    setLoading(true);
    setTimeout(() => {
      const sample = `[개인정보 처리방침 초안]\n\n1. 개인정보의 수집 및 이용 목적\n- 회사는 원활한 보안 서비스 제공을 위해 최소한의 개인정보를 수집합니다.\n\n2. 수집하는 개인정보 항목\n- 필수: 성명, 이메일, 접속 로그\n\n3. 개인정보의 보유 및 이용 기간\n- 회원 탈퇴 시 혹은 라이선스 종료 시 즉시 파기\n\n4. 개인정보의 파기 절차 및 방법\n- 복구 불가능한 기술적 방법으로 영구 삭제`;
      setPolicy(sample);
      setLoading(false);
    }, 1500);
  };

  const handleAiRewrite = () => {
    if (!userInput) return;
    setLoading(true);
    setTimeout(() => {
      setPolicy(prev => prev + `\n\n[AI 업데이트 반영 사항]\n- 추가 요청: ${userInput}\n- 반영 내용: 해당 항목에 대한 법적 근거 및 관리 지침이 본 처리방침에 추가되었습니다.`);
      setUserInput("");
      setLoading(false);
    }, 2000);
  };

  const downloadFile = (format) => {
    if (!policy) return;
    let content = policy;
    let fileName = `Privacy_Policy_${new Date().toISOString().split('T')[0]}`;
    let type = "text/plain";

    if (format === 'excel') {
      content = "\ufeff" + "목차,내용\n" + policy.split('\n').map(line => {
        if (!line.trim()) return "";
        return `"${line.split('.')[0]}","${line.replace(/"/g, '""')}"`;
      }).filter(l => l).join('\n');
      fileName += ".csv";
      type = "text/csv;charset=utf-8;";
    } else {
      fileName += ".txt";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    authFetch('/api/admin/logs', { method: 'POST', body: JSON.stringify({ action: 'POLICY_DOWNLOAD', target: 'PRIVACY_POLICY', reason: `${format.toUpperCase()} 형식 문서 반출` }) });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await authFetch('/api/admin/policies', { method: 'POST', body: JSON.stringify({ content: policy, reason: 'AI 에이전트 기반 약관 개정' }) });
      if (res.ok) alert('데이터베이스에 안전하게 보관 및 게시되었습니다.');
    } catch { } finally { setSaveLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-6">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">약관 및 정책 관리</h2>
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> 현재 개인정보 처리방침</span>
            <div className="flex gap-3">
              <button onClick={() => downloadFile('txt')} title="텍스트 다운로드" className="text-slate-400 hover:text-slate-900 transition-colors"><FileDown size={18}/></button>
              <button onClick={() => downloadFile('excel')} className="text-emerald-500 hover:text-emerald-700 transition-colors flex items-center gap-1 font-black text-[10px] uppercase"><CardIcon size={14}/> Excel</button>
            </div>
          </div>
          <textarea value={policy} onChange={e=>setPolicy(e.target.value)} className="flex-1 w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 outline-none font-medium text-sm leading-relaxed no-scrollbar resize-none" placeholder="정책 내용을 입력하거나 AI 에이전트에게 작성을 요청하세요." />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={generateSample} className="py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase italic">샘플 초안 불러오기</button>
            <button onClick={handleSave} disabled={saving || !policy} className="py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100">
              <SaveIcon size={20}/> {saving ? '처리 중...' : '최종 저장 및 게시'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] opacity-10 rotate-12"><Sparkles size={200} /></div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Wand2 size={24}/></div>
            <h3 className="text-2xl font-black italic uppercase">AI Policy Agent</h3>
          </div>
          <p className="text-sm font-bold opacity-90 leading-relaxed mb-10">인공지능 보안 에이전트가 대표님의 비즈니스 특성에 맞는 개인정보 처리방침 작성을 보좌합니다. 변경이 필요한 내용을 입력창에 남겨주세요.</p>
          <div className="space-y-4">
            <div className="relative">
              <MessageSquare className="absolute top-5 left-6 text-blue-300" size={20} />
              <textarea value={userInput} onChange={e=>setUserInput(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white/10 border border-white/20 rounded-3xl outline-none font-bold text-sm placeholder:text-white/40 min-h-[120px] resize-none" placeholder="예: '전화번호 수집 목적을 마케팅 활용으로 변경해줘' 등" />
            </div>
            <button onClick={handleAiRewrite} disabled={loading || !userInput} className="w-full py-5 bg-white text-blue-600 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl">
              {loading ? <RefreshCw className="animate-spin" size={20}/> : <Wand2 size={20}/>}
              {loading ? '에이전트 분석 중...' : 'AI에게 재작성 요청'}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">에이전트 권고 사항</h4>
          <ul className="space-y-3">
            {['수집 항목의 최소성 원칙을 준수하세요.', '제3자 제공 시 반드시 이용자 동의가 필요합니다.', '파기 절차를 구체적으로 명시하는 것이 안전합니다.'].map((tip, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[11px] font-bold text-slate-600"><CheckCircle size={14} className="text-emerald-500" /> {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- 관리자 뷰 ---
function CompanyAdminView({ 
  activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout, onRefresh, onNavigate,
  dashStats, memberRecords, memberLoading, handleDeleteRecord, onVaultComplete, isSandbox, user, timerKey 
}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal] = useState({ open: false, type: 'add', data: { name: '', email: '', password: '', role: 'user', permissions: ['dashboard'], licenseExpiry: '' } });
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [otpSetup, setOtpSetup] = useState({ open: false, qrCode: '', secret: '', code: '' });

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pms_token')}`, ...(options.headers || {}) },
    }), []);

  const loadAuditLogs = useCallback(async () => {
    if (isSandbox) return;
    setLogsLoading(true);
    try { const res = await authFetch('/api/admin/logs'); if (res.ok) setAuditLogs(await res.json()); } catch { }
    finally { setLogsLoading(false); }
  }, [authFetch, isSandbox]);

  const loadUsers = useCallback(async () => {
    if (isSandbox) return;
    setUsersLoading(true);
    try { const res = await authFetch('/api/admin/admins'); if (res.ok) setUsers(await res.json()); } catch { }
    finally { setUsersLoading(false); }
  }, [authFetch, isSandbox]);

  useEffect(() => {
    if (activeTab === 'dashboard') loadAuditLogs();
    if (activeTab === 'user_manage') loadUsers();
  }, [activeTab, loadAuditLogs, loadUsers]);

  const handleUserAction = async (e) => {
    e.preventDefault();
    const isEdit = userModal.type === 'edit';
    const url = isEdit ? `/api/admin/admins/${userModal.data.id}` : '/api/admin/admins';
    try {
      const res = await authFetch(url, { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(userModal.data) });
      if (res.ok) { setUserModal({ ...userModal, open: false }); loadUsers(); }
      else { const d = await res.json(); alert(d.message || d.error); }
    } catch { alert('서버 통신 실패'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (isSandbox) { alert('체험 모드에서는 기능을 지원하지 않습니다.'); return; }
    if (passForm.new !== passForm.confirm) { setPassError('새 비밀번호가 일치하지 않습니다.'); return; }
    setPassError(''); setPassSuccess('');
    try {
      const res = await authFetch('/api/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new }) });
      const data = await res.json();
      if (res.ok) { setPassSuccess(data.message); setPassForm({ current: '', new: '', confirm: '' }); }
      else { setPassError(data.error); }
    } catch { setPassError('서버 통신 실패'); }
  };

  const startOtpSetup = async () => {
    const res = await authFetch('/api/auth/otp/setup');
    const data = await res.json();
    setOtpSetup({ ...otpSetup, open: true, qrCode: data.qrCodeUrl, secret: data.secret, code: '' });
  };

  const enableOtp = async () => {
    const res = await authFetch('/api/auth/otp/enable', { method: 'POST', body: JSON.stringify({ otpCode: otpSetup.code }) });
    if (res.ok) { alert('2단계 인증이 활성화되었습니다.'); setOtpSetup({ ...otpSetup, open: false }); }
    else { const d = await res.json(); alert(d.error); }
  };

  const disableOtp = async () => {
    if (!confirm('2단계 인증을 해제하시겠습니까?')) return;
    const res = await authFetch('/api/auth/otp/disable', { method: 'POST' });
    if (res.ok) alert('2단계 인증이 해제되었습니다.');
  };

  const getDaysLeft = (expiry) => {
    if (!expiry) return 0;
    const diff = new Date(expiry) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const renderContent = () => {
    const daysLeft = isSandbox ? 30 : getDaysLeft(user?.licenseExpiry);
    const isAdmin = user?.role === 'admin';
    const hasPermission = isSandbox || (user?.permissions || []).includes(activeTab);
    const isExpired = !isSandbox && !isAdmin && daysLeft <= 0;

    if (isExpired && activeTab !== 'my_settings') return <RestrictedView title="라이선스 만료됨" message="보안 서비스 이용 기간이 종료되었습니다. 계속 이용하시려면 라이선스를 갱신하거나 구독을 연장해 주십시오." onUpgrade={() => setActiveTab('subscription')} />;
    if (!hasPermission && !isAdmin) return <RestrictedView title="접근 권한 제한" message="해당 기능은 현재 대표님의 권한 등급에서는 접근이 제한되어 있습니다. 업그레이드를 통해 모든 보안 기능을 활성화하세요." onUpgrade={() => setActiveTab('subscription')} />;

    switch (activeTab) {
      case 'dashboard':
        const displayDays = isAdmin ? '영구' : daysLeft + '일';
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-end gap-4"><h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">운영 관제 센터</h2><button onClick={loadAuditLogs} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={18} className={logsLoading ? 'animate-spin' : ''} /></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{ l: '총 보관 자산', v: dashStats.total.toLocaleString(), i: Database, c: 'text-blue-600' }, { l: '정보 동의율', v: (dashStats.consentRate || 98) + '%', i: ShieldCheck, c: 'text-emerald-600' }, { l: '금일 보안 활동', v: String(dashStats.today || 0), i: Activity, c: 'text-indigo-600' }, { l: '라이선스 상태', v: displayDays, i: CreditCard, c: !isAdmin && daysLeft < 7 ? 'text-rose-600' : 'text-amber-600' }].map((s, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"><div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 w-fit mb-6"><s.i size={20} /></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p><p className={`text-3xl font-black italic ${s.c}`}>{s.v}</p></div>
              ))}
            </div>
            {!isSandbox && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-3"><History size={20} className="text-blue-600" /> 전방위 보안 감사 로그</h3><span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase italic tracking-widest">Real-time Monitoring</span></div>
                <div className="overflow-x-auto text-xs"><table className="w-full text-left border-collapse font-bold"><thead><tr className="border-b-2 border-slate-50 text-slate-400 font-black uppercase"><th className="py-4 px-4">일시</th><th className="py-4 px-4">행위자</th><th className="py-4 px-4">작업 코드</th><th className="py-4 px-4">대상 리소스</th><th className="py-4 px-4">수행 상세</th></tr></thead><tbody className="divide-y divide-slate-50 text-slate-700">
                  {auditLogs.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-slate-400 italic font-medium">기록된 보안 활동이 없습니다.</td></tr> : auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-slate-400 tabular-nums">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                      <td className="py-4 px-4">{log.userName}</td>
                      <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.action.includes('FAILED') || log.action.includes('DENIED') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{log.action}</span></td>
                      <td className="py-4 px-4 italic font-medium text-slate-400">{log.target}</td>
                      <td className="py-4 px-4 font-medium truncate max-w-xs">{log.reason}</td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}
          </div>
        );
      case 'user_manage':
        return (
          <div className="space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center gap-4"><h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">이용자 계정 관리</h2>{!isSandbox && <button onClick={() => setUserModal({ open: true, type: 'add', data: { name: '', email: '', password: '', role: 'user', permissions: ['dashboard'], licenseExpiry: new Date(Date.now() + 30*24*60*60*1000).toISOString() } })} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition shadow-lg shadow-slate-200 uppercase italic"><Plus size={16} /> 신규 이용자 추가</button>}</div>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="overflow-x-auto text-sm font-bold text-slate-700"><table className="w-full text-left border-collapse"><thead><tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">성명</th><th className="py-4 px-6">이메일</th><th className="py-4 px-6">권한/상태</th><th className="py-4 px-6">라이선스 키</th><th className="py-4 px-6">만료일</th><th className="py-4 px-6 text-right">관리</th></tr></thead><tbody className="divide-y divide-slate-50">
                {isSandbox ? <tr><td colSpan={6} className="py-10 text-center italic text-slate-400">체험 모드 이용자 조회 불가</td></tr> : users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors"><td className="py-5 px-6 italic uppercase">{u.name}</td><td className="py-5 px-6 font-medium text-slate-500">{u.email}</td><td className="py-5 px-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{u.role === 'admin' ? '관리자' : '일반'}</span></td><td className="py-5 px-6 text-xs font-mono text-slate-400">{u.licenseKey || 'N/A'}</td><td className={`py-5 px-6 text-xs font-bold ${u.role !== 'admin' && getDaysLeft(u.licenseExpiry) < 7 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>{u.licenseExpiry ? new Date(u.licenseExpiry).toLocaleDateString() : '-'}</td><td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300"><Edit3 size={18} className="cursor-pointer hover:text-blue-600" onClick={() => setUserModal({ open: true, type: 'edit', data: { ...u, permissions: u.permissions || ['dashboard'], password: '', licenseExpiry: u.licenseExpiry || '' } })} /><Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => {if(confirm('삭제하시겠습니까?')) authFetch(`/api/admin/admins/${u.id}`, {method:'DELETE'}).then(()=>loadUsers());}} /></td></tr>
                ))}
              </tbody></table></div>
            </div>
            {userModal.open && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative overflow-y-auto max-h-[90vh]"><button onClick={() => setUserModal({ ...userModal, open: false })} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24}/></button><h3 className="text-3xl font-black text-slate-900 uppercase italic mb-8">{userModal.type === 'add' ? '이용자 추가' : '정보 수정'}</h3>
                  <form onSubmit={handleUserAction} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">성명</span><input type="text" value={userModal.data.name} onChange={e=>setUserModal({...userModal, data: {...userModal.data, name: e.target.value}})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required /></div>
                      <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">이메일</span><input type="email" value={userModal.data.email} onChange={e=>setUserModal({...userModal, data: {...userModal.data, email: e.target.value}})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required disabled={userModal.type === 'edit'} /></div>
                    </div>
                    <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">비밀번호 {userModal.type === 'edit' && '(변경 시에만)'}</span><input type="password" value={userModal.data.password} onChange={e=>setUserModal({...userModal, data: {...userModal.data, password: e.target.value}})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required={userModal.type === 'add'} /></div>
                    <div className="space-y-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={12}/> 라이선스 만료일 설정</span><input type="date" value={userModal.data.licenseExpiry ? userModal.data.licenseExpiry.split('T')[0] : ''} onChange={e=>setUserModal({...userModal, data: {...userModal.data, licenseExpiry: new Date(e.target.value).toISOString()}})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required /></div>
                    <div className="space-y-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">보안 권한 등급</span><div className="flex gap-2"><button type="button" onClick={() => setUserModal({...userModal, data: {...userModal.data, role: 'admin'}})} className={`flex-1 py-3 rounded-xl font-black text-xs border ${userModal.data.role === 'admin' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>관리자 (Admin)</button><button type="button" onClick={() => setUserModal({...userModal, data: {...userModal.data, role: 'user'}})} className={`flex-1 py-3 rounded-xl font-black text-xs border ${userModal.data.role === 'user' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>일반이용자 (User)</button></div></div>
                    <div className="space-y-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">메뉴 접근 제어 (ACL)</span><div className="grid grid-cols-2 gap-2">{ALL_PERMISSIONS.map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"><input type="checkbox" checked={(userModal.data.permissions || []).includes(p.id)} onChange={(e) => {
                            const currentPerms = userModal.data.permissions || [];
                            const next = e.target.checked ? [...currentPerms, p.id] : currentPerms.filter(id => id !== p.id);
                            setUserModal({...userModal, data: {...userModal.data, permissions: next}});
                          }} className="w-4 h-4 rounded border-slate-200 text-blue-600" /><span className="text-xs font-bold text-slate-600">{p.label}</span></label>
                      ))}</div></div>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase italic">{userModal.type === 'add' ? '이용자 계정 생성' : '변경 사항 저장'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'subscription':
        return (
          <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
            <div className="text-center"><h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">보안 등급 업그레이드</h2><p className="text-slate-500 font-medium">기업의 규모에 맞는 최적의 보안 플랜을 선택하세요.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: '스타트업', p: '무료', f: ['기본 대시보드', '30일 체험', '회원 10명 미만'] },
                { n: '비즈니스', p: '월 99,000원', f: ['보안 금고 무제한', '실시간 로그 분석', 'ACL 정밀 제어'], h: true },
                { n: '엔터프라이즈', p: '별도 문의', f: ['맞춤형 보안 정책', '전담 보안 매니저', 'SLA 보장'] }
              ].map((plan, i) => (
                <div key={i} className={`p-10 rounded-[3rem] border ${plan.h ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'bg-white text-slate-900 border-slate-100'} flex flex-col justify-between`}>
                  <div><h4 className="text-xl font-black uppercase italic mb-2">{plan.n}</h4><p className={`text-3xl font-black mb-10 ${plan.h ? 'text-blue-400' : 'text-blue-600'}`}>{plan.p}</p>
                    <ul className="space-y-4 mb-10">{plan.f.map((f, j) => (<li key={j} className="flex items-center gap-3 text-xs font-bold opacity-80"><CheckCircle size={16} /> {f}</li>))}</ul>
                  </div>
                  <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase ${plan.h ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>플랜 선택하기</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'policy_manage': return <PolicyAIView authFetch={authFetch} />;
      case 'my_settings':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">내 정보 관리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm"><h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 flex items-center gap-2"><Key size={20} className="text-blue-600"/> 보안 설정</h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100"><div><p className="font-black text-slate-800 italic uppercase">2단계 인증 (OTP)</p><p className="text-[10px] font-bold text-slate-400">모바일 앱을 통한 추가 인증</p></div>{user?.otpEnabled ? <button onClick={disableOtp} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] border border-rose-100">해제하기</button> : <button onClick={startOtpSetup} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-blue-100">설정하기</button>}</div>
                  <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">비밀번호 업데이트</p>
                    <input type="password" value={passForm.current} onChange={e=>setPassForm({...passForm, current:e.target.value})} placeholder="현재 비밀번호" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                    <input type="password" value={passForm.new} onChange={e=>setPassForm({...passForm, new:e.target.value})} placeholder="새 비밀번호" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                    <input type="password" value={passForm.confirm} onChange={e=>setPassForm({...passForm, confirm:e.target.value})} placeholder="새 비밀번호 확인" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                    {passError && <p className="text-rose-500 text-xs font-bold text-center">{passError}</p>}{passSuccess && <p className="text-emerald-500 text-xs font-bold text-center">{passSuccess}</p>}
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all">비밀번호 변경</button>
                  </form>
                </div>
              </div>
              <div className="bg-blue-600 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden"><div className="absolute top-[-20px] right-[-20px] opacity-10"><Shield size={150} /></div>
                <div><h3 className="text-xl font-black uppercase italic mb-6">나의 라이선스</h3><div className="space-y-4"><div><p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">라이선스 키</p><p className="text-sm font-mono font-black mt-1 bg-white/10 p-2 rounded-lg break-all">{user?.licenseKey || 'TEMP-KEY'}</p></div><div><p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">만료 예정일</p><p className="text-xl font-black italic mt-1">{isAdmin ? '영구 라이선스' : (user?.licenseExpiry ? new Date(user.licenseExpiry).toLocaleDateString() : '체험 종료 시')}</p></div></div></div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 mt-8"><p className="text-[10px] font-bold leading-relaxed">{isAdmin ? '관리자님은 모든 기능을 제한 없이 이용할 수 있습니다.' : '잔여 기간 이후에는 데이터 접근이 제한되오니 정기적으로 갱신하시기 바랍니다.'}</p></div>
              </div>
            </div>
            {otpSetup.open && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
                <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 relative text-center">
                  <button onClick={() => setOtpSetup({ ...otpSetup, open: false })} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24}/></button>
                  <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600"><QrCode size={32}/></div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2">OTP 보안 설정</h3>
                  <p className="text-[10px] text-slate-400 font-bold mb-8 leading-relaxed">Google Authenticator 등 OTP 앱으로<br/>아래 QR코드를 스캔해 주세요.</p>
                  <div className="bg-white p-4 border border-slate-100 rounded-[2rem] shadow-inner mb-8 inline-block"><img src={otpSetup.qrCode} alt="OTP QR" className="w-40 h-40" /></div>
                  <div className="space-y-4"><input type="text" maxLength={6} value={otpSetup.code} onChange={e=>setOtpSetup({...otpSetup, code: e.target.value})} placeholder="000000" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-center tracking-[0.5em] text-xl" /><button onClick={enableOtp} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700">활성화하기</button></div>
                </div>
              </div>
            )}
          </div>
        );
      case 'security_vault': return <SecurityVault onProcessComplete={onVaultComplete} />;
      case 'member_db':
        return (
          <div className="space-y-8 animate-in zoom-in-95">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10 gap-4"><h3 className="text-2xl font-black text-slate-800 uppercase italic">고객 회원 자산 DB</h3><button onClick={() => setActiveTab('security_vault')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase italic whitespace-nowrap"><Plus size={16} /> 대량 보안 처리</button></div>
              <div className="overflow-x-auto text-sm font-bold text-slate-700"><table className="w-full text-left border-collapse"><thead><tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">성명</th><th className="py-4 px-6">연락처</th><th className="py-4 px-6">상태</th><th className="py-4 px-6 text-right">제어</th></tr></thead><tbody className="divide-y divide-slate-50">
                {memberLoading ? <tr><td colSpan={4} className="py-10 text-center">로드 중...</td></tr> : memberRecords.length === 0 ? <tr><td colSpan={4} className="py-10 text-center italic text-slate-400">데이터가 없습니다.</td></tr> : memberRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors"><td className="py-5 px-6 italic">{row.name}</td><td className="py-5 px-6 tabular-nums">{row.phone || '***-****-****'}</td><td className="py-5 px-6"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.status === 'ENCRYPTED' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>{row.status === 'ENCRYPTED' ? '보안 암호화' : '평문 노출'}</span></td><td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300"><Eye size={18} className="cursor-pointer hover:text-blue-600" /><Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => handleDeleteRecord(row.id)} /></td></tr>
                ))}
              </tbody></table></div>
            </div>
          </div>
        );
      default: return <div className="p-24 text-center font-black text-slate-400 uppercase italic">모듈 준비 중...</div>;
    }
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex animate-in fade-in duration-700 overflow-hidden">
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 cursor-pointer overflow-hidden" onClick={() => setActiveTab('dashboard')}><Shield className="text-blue-500 shrink-0" size={28} />{sidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter uppercase whitespace-nowrap">PMS 센터</span>}</div>
        <nav className="flex-1 py-8 px-3 space-y-1 no-scrollbar overflow-y-auto">
          {COMPANY_MENU.filter(m => !m.adminOnly || (user && user.role === 'admin')).map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === m.id ? 'bg-blue-600 shadow-xl shadow-blue-900/40 font-bold text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}><m.icon size={20} className="shrink-0" /><span className={`text-sm whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{m.label}</span></button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={onLogout} className="flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-all w-full"><LogIn size={20} className="shrink-0" />{sidebarOpen && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">보안 로그아웃</span>}</button></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex justify-between items-center sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-6"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 shadow-sm"><Menu size={20} /></button><SessionTimer initialTime={3600} onLogout={onLogout} onRefresh={onRefresh} isSandbox={isSandbox} resetKey={timerKey} /></div>
          <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><p className="text-sm font-black text-slate-800 uppercase italic truncate max-w-[150px]">{isSandbox ? '익명 이용자 (체험)' : `${user?.name || '보안 담당자'} (${user?.role === 'admin' ? '관리자' : '일반'})`}</p><div className="flex justify-end items-center gap-1.5 mt-0.5"><span className={`w-1.5 h-1.5 ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></span><p className={`text-[9px] ${isSandbox ? 'text-amber-500' : 'text-emerald-500'} font-bold uppercase tracking-widest`}>{isSandbox ? '체험 계정' : '인증됨'}</p></div></div><div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-500 shadow-inner shrink-0"><Users size={18} /></div></div>
        </header>
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar">{renderContent()}</main>
      </div>
    </div>
  );
}

// --- 메인 앱 컴포넌트 ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pms_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [dashStats, setDashStats] = useState({ total: 0, today: 0 });
  const [memberRecords, setMemberRecords] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // 인증 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpMode, setOtpMode] = useState({ active: false, tempToken: '', code: '' });

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...(options.headers || {}) } }), [authToken]);

  const loadData = useCallback(() => {
    if (currentScreen === 'sandbox') { setDashStats({ total: 1240, today: 12, consentRate: 98 }); setMemberRecords([{ id: '1', name: '홍길동(예시)', phone: '010-1234-5678', status: 'ENCRYPTED' }]); return; }
    if (!authToken) return;
    authFetch('/api/auth/profile').then(r => r.ok && r.json().then(setCurrentUser));
    authFetch('/api/admin/db/stats').then(r => r.ok && r.json().then(setDashStats));
    setMemberLoading(true); authFetch('/api/admin/records').then(r => r.ok && r.json().then(setMemberRecords)).finally(()=>setMemberLoading(false));
  }, [authFetch, currentScreen, authToken]);

  useEffect(() => { if ((currentScreen === 'company_admin' || currentScreen === 'sandbox')) loadData(); }, [currentScreen, authToken, loadData]);

  const handleRefreshSession = async () => {
    try {
      const res = await authFetch('/api/auth/refresh');
      if (res.ok) {
        const d = await res.json();
        localStorage.setItem('pms_token', d.token);
        setAuthToken(d.token);
        setTimerKey(prev => prev + 1);
      }
    } catch { }
  };

  const handleSignup = async (e) => {
    e?.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
      const d = await res.json();
      if (res.ok) { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentUser(d.user); setCurrentScreen('company_admin'); }
      else setError(d.error);
    } catch { setError('서버 연결 실패'); } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e?.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await res.json();
      if (res.ok) {
        if (d.requiresOTP) { setOtpMode({ active: true, tempToken: d.tempToken, code: '' }); }
        else { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentUser(d.user); setCurrentScreen('company_admin'); }
      } else setError(d.error);
    } catch { setError('서버 연결 실패'); } finally { setLoading(false); }
  };

  const handleOtpLogin = async (e) => {
    e?.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/auth/login/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tempToken: otpMode.tempToken, otpCode: otpMode.code }) });
      const d = await res.json();
      if (res.ok) { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentUser(d.user); setOtpMode({ active: false, tempToken: '', code: '' }); setCurrentScreen('company_admin'); }
      else alert(d.error);
    } catch { alert('서버 연결 실패'); } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google-mock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'google-user@cert.pms' }) });
      const d = await res.json();
      if (res.ok) {
        if (d.requiresOTP) { setOtpMode({ active: true, tempToken: d.tempToken, code: '' }); }
        else { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentUser(d.user); setCurrentScreen('company_admin'); }
      }
    } catch { alert('구글 인증 실패'); } finally { setLoading(false); }
  };

  return (
    <div className="selection:bg-blue-600 selection:text-white h-screen overflow-hidden bg-white font-['Noto_Sans_KR']">
      <div className={`h-full ${currentScreen === 'company_admin' || currentScreen === 'sandbox' ? 'overflow-hidden' : 'overflow-y-auto scroll-smooth'}`}>
        {currentScreen === 'landing' && <LandingView onNavigate={setCurrentScreen} />}
        
        {currentScreen === 'login' && !otpMode.active && (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-[440px] bg-white rounded-[4rem] shadow-2xl p-14 border border-slate-100 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => setCurrentScreen('landing')}><div className="bg-blue-600 p-4 rounded-3xl text-white mb-5 shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500"><Shield size={32} /></div><h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">보안 포털 접속</h2></div>
              <form onSubmit={handleLogin} className="space-y-6">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="보안 이메일 주소" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" required />
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" required />
                <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-50"><button type="button" onClick={handleGoogleLogin} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition"><Globe size={14}/> Google 계정으로 접속</button></div>
                {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-blue-700 transition-all uppercase italic">{loading ? '인증 중...' : '접속 승인 요청'}</button>
                <div className="flex flex-col gap-3 mt-6"><p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600" onClick={()=>setCurrentScreen('signup')}>신규 보안 계정 생성</p><p className="text-center text-slate-300 text-[10px] font-black uppercase cursor-pointer hover:text-amber-500" onClick={()=>setCurrentScreen('sandbox')}>무료 체험 모드 입장</p></div>
              </form>
            </div>
          </div>
        )}

        {otpMode.active && (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 animate-in zoom-in duration-500">
            <div className="w-full max-w-[400px] bg-white rounded-[4rem] shadow-2xl p-12 text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600"><Smartphone size={32}/></div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2">2단계 인증</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-10 leading-relaxed">등록된 기기의 OTP 앱에서<br/>6자리 인증 코드를 확인 후 입력해 주세요.</p>
              <form onSubmit={handleOtpLogin} className="space-y-6">
                <input type="text" maxLength={6} value={otpMode.code} onChange={e=>setOtpMode({...otpMode, code: e.target.value})} placeholder="000000" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-center tracking-[0.5em] text-3xl" required autoFocus />
                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase italic">인증 완료 및 접속</button>
                <button type="button" onClick={()=>setOtpMode({active:false, tempToken:'', code:''})} className="text-slate-400 text-xs font-bold hover:text-slate-900 transition">로그인 화면으로 돌아가기</button>
              </form>
            </div>
          </div>
        )}

        {currentScreen === 'signup' && (
          <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-[480px] bg-white rounded-[4rem] shadow-2xl p-16 border border-slate-100 relative">
              <button onClick={()=>setCurrentScreen('landing')} className="absolute top-10 left-10 text-slate-300 hover:text-slate-900"><ChevronLeft size={32}/></button>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12 text-center italic">회원가입</h2>
              <form onSubmit={handleSignup} className="space-y-6">
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="성명" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required />
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required />
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호 설정" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" required />
                {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 uppercase italic">가입하기</button>
                <p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600 transition mt-6" onClick={()=>setCurrentScreen('login')}>이미 계정이 있습니까? 로그인</p>
              </form>
            </div>
          </div>
        )}

        {(currentScreen === 'company_admin' || currentScreen === 'sandbox') && (
          <CompanyAdminView activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={()=>{localStorage.removeItem('pms_token'); setAuthToken(''); setCurrentUser(null); setCurrentScreen('login');}} onRefresh={handleRefreshSession} onNavigate={setCurrentScreen} dashStats={dashStats} memberRecords={memberRecords} memberLoading={memberLoading} handleDeleteRecord={(id)=>{if(confirm('파기하시겠습니까?')) authFetch(`/api/admin/records/${id}`, {method:'DELETE'}).then(()=>loadData());}} onVaultComplete={async (data)=>{if(currentScreen === 'sandbox') return; try{const r = await authFetch('/api/admin/records/batch', {method:'POST', body:JSON.stringify({records: data.records})}); if(r.ok) loadData();}catch{}}} isSandbox={currentScreen === 'sandbox'} user={currentUser} timerKey={timerKey} />
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
