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
  Smartphone, EyeOff, Share2, Clock, ExternalLink, Scale, Info, FileSearch, Save, Trash2, RefreshCw, UserCheck, Edit3, Send, User
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
  { id: 'my_settings', label: '내 정보 관리', icon: User },
];

const CHART_DATA = [
  { name: '월', value: 400, api: 2400 }, { name: '화', value: 300, api: 1398 },
  { name: '수', value: 600, api: 9800 }, { name: '목', value: 800, api: 3908 },
  { name: '금', value: 500, api: 4800 },
];

// --- 세션 타이머 컴포넌트 ---
const SessionTimer = ({ initialTime, onLogout, isSandbox }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  useEffect(() => {
    if (isSandbox) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(interval); onLogout?.(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout, isSandbox]);
  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  
  if (isSandbox) return <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-100 text-xs font-black animate-pulse">체험 모드 (데이터가 저장되지 않음)</div>;

  return (
    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-inner">
      <Clock size={14} className="text-blue-600" />
      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">세션 잔여 시간</span>
      <span className="text-sm font-black text-blue-600 tabular-nums">{formatTime(timeLeft)}</span>
      <button onClick={() => setTimeLeft(4800)} className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded ml-2 hover:bg-blue-700 transition">연장</button>
    </div>
  );
};

// --- 화면별 뷰 컴포넌트 ---

const LandingView = ({ onNavigate }) => (
  <div className="min-h-screen bg-white animate-in fade-in duration-700 overflow-y-auto">
    <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-10">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200"><Shield size={24} /></div>
        <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">PMS 센터</span>
      </div>
      <div className="flex gap-4">
        <button onClick={() => onNavigate('login')} className="text-sm font-bold text-slate-600 px-4 hover:text-blue-600 transition">보안 로그인</button>
        <button onClick={() => onNavigate('signup')} className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">무료 시작하기</button>
      </div>
    </nav>
    <main className="pt-40 text-center px-6">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-8 uppercase"><Zap size={14} fill="currentColor" /> 보안 및 신뢰 최우선 (Secured by CERT)</div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">개인정보 보호,<br /><span className="text-blue-600">자동화</span>의 시대입니다.</h1>
        <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">복잡한 보안 컴플라이언스 대응부터 데이터 암호화 보관까지,<br />기업의 보안 리스크를 단 하나의 플랫폼으로 해결하세요.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => onNavigate('sandbox')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">지금 바로 도입하기 (체험)</button>
        </div>
      </div>
      <div className="mt-24 max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden text-left grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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

const CompanyAdminView = ({ 
  activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout, onNavigate,
  dashStats, memberRecords, memberLoading, handleDeleteRecord, onVaultComplete, isSandbox 
}) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // 비밀번호 변경 폼
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (isSandbox) { alert('체험 모드에서는 기능을 지원하지 않습니다.'); return; }
    if (passForm.new !== passForm.confirm) { setPassError('새 비밀번호가 일치하지 않습니다.'); return; }
    setPassError(''); setPassSuccess('');
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new })
      });
      const data = await res.json();
      if (res.ok) { setPassSuccess(data.message); setPassForm({ current: '', new: '', confirm: '' }); }
      else { setPassError(data.error); }
    } catch { setPassError('서버 통신 실패'); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-end">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">운영 관제 센터</h2>
              <button onClick={loadAuditLogs} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={18} className={logsLoading ? 'animate-spin' : ''} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{ l: '총 보관 자산', v: dashStats.total.toLocaleString(), c: 'text-blue-600', i: Database }, { l: '정보 동의율', v: (dashStats.consentRate || 98) + '%', c: 'text-emerald-600', i: ShieldCheck }, { l: '금일 보안 활동', v: String(dashStats.today || 0), c: 'text-indigo-600', i: Activity }, { l: '라이선스 상태', v: '유효', i: CreditCard }].map((s, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 w-fit mb-6"><s.i size={20} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                  <p className={`text-3xl font-black ${s.c || 'text-slate-900'} italic`}>{s.v}</p>
                </div>
              ))}
            </div>
            {!isSandbox && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 italic uppercase mb-8 flex items-center gap-3"><History size={20} className="text-blue-600" /> 최근 보안 감사 로그</h3>
                <div className="overflow-x-auto text-xs"><table className="w-full text-left border-collapse"><thead><tr className="border-b-2 border-slate-50 text-slate-400 font-black uppercase"><th className="py-4 px-4">일시</th><th className="py-4 px-4">담당자</th><th className="py-4 px-4">작업</th><th className="py-4 px-4">대상 자산</th><th className="py-4 px-4">수행 사유</th></tr></thead><tbody className="divide-y divide-slate-50">
                  {auditLogs.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-slate-400 italic">기록된 보안 활동이 없습니다.</td></tr> : auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-slate-400 tabular-nums">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                      <td className="py-4 px-4 font-bold text-slate-700">{log.userName}</td>
                      <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black ${log.action === 'ENCRYPT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.action === 'ENCRYPT' ? '암호화' : '복호화'}</span></td>
                      <td className="py-4 px-4 text-slate-600 italic font-medium">{log.target}</td>
                      <td className="py-4 px-4 text-slate-500 font-medium truncate max-w-xs">{log.reason}</td>
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
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">이용자 계정 관리</h2>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-sm font-bold text-slate-700"><thead><tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">성명</th><th className="py-4 px-6">이메일</th><th className="py-4 px-6">권한</th><th className="py-4 px-6 text-right">제어</th></tr></thead><tbody className="divide-y divide-slate-50">
                {isSandbox ? <tr><td colSpan={4} className="py-10 text-center italic text-slate-400">체험 모드에서는 이용자 정보를 조회할 수 없습니다.</td></tr> : users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors"><td className="py-5 px-6 italic uppercase">{u.name}</td><td className="py-5 px-6 font-medium text-slate-500">{u.email}</td><td className="py-5 px-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{u.role === 'admin' ? '관리자' : '일반'}</span></td><td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300"><Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => {if(confirm('삭제하시겠습니까?')) authFetch(`/api/admin/admins/${u.id}`, {method:'DELETE'}).then(()=>loadUsers());}} /></td></tr>
                ))}
              </tbody></table></div>
            </div>
          </div>
        );
      case 'my_settings':
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">내 정보 관리</h2>
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 flex items-center gap-2"><Key size={20} className="text-blue-600"/> 비밀번호 변경</h3>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">현재 비밀번호</span>
                  <input type="password" value={passForm.current} onChange={e=>setPassForm({...passForm, current:e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">새 비밀번호</span>
                    <input type="password" value={passForm.new} onChange={e=>setPassForm({...passForm, new:e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">새 비밀번호 확인</span>
                    <input type="password" value={passForm.confirm} onChange={e=>setPassForm({...passForm, confirm:e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold" />
                  </div>
                </div>
                {passError && <p className="text-rose-500 text-xs font-bold text-center">{passError}</p>}
                {passSuccess && <p className="text-emerald-500 text-xs font-bold text-center">{passSuccess}</p>}
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200">비밀번호 업데이트</button>
              </form>
            </div>
          </div>
        );
      case 'security_vault': return <SecurityVault onProcessComplete={onVaultComplete} />;
      case 'member_db':
        return (
          <div className="space-y-8 animate-in zoom-in-95">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10"><h3 className="text-2xl font-black text-slate-800 uppercase italic">고객 회원 자산 DB</h3><button onClick={() => setActiveTab('security_vault')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase italic"><Plus size={16} /> 대량 보안 처리</button></div>
              <div className="overflow-x-auto text-sm font-bold text-slate-700"><table className="w-full text-left border-collapse"><thead><tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest"><th className="py-4 px-6">성명</th><th className="py-4 px-6">연락처</th><th className="py-4 px-6">상태</th><th className="py-4 px-6 text-right">제어</th></tr></thead><tbody className="divide-y divide-slate-50">
                {memberLoading ? <tr><td colSpan={4} className="py-10 text-center">로드 중...</td></tr> : memberRecords.length === 0 ? <tr><td colSpan={4} className="py-10 text-center italic text-slate-400">데이터가 없습니다.</td></tr> : memberRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors"><td className="py-5 px-6 italic">{row.name}</td><td className="py-5 px-6 tabular-nums">{row.phone || '***-****-****'}</td><td className="py-5 px-6"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.status === 'ENCRYPTED' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>{row.status === 'ENCRYPTED' ? '보안 암호화' : '평문 노출'}</span></td><td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-300"><Eye size={18} className="cursor-pointer hover:text-blue-600" /><Trash2 size={18} className="cursor-pointer hover:text-rose-600" onClick={() => handleDeleteRecord(row.id)} /></td></tr>
                ))}
              </tbody></table></div>
            </div>
          </div>
        );
      default: return <div className="p-24 text-center font-black text-slate-400 uppercase italic">개발 중인 보안 모듈입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex animate-in fade-in duration-700 overflow-hidden">
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 cursor-pointer overflow-hidden" onClick={() => onNavigate('landing')}><Shield className="text-blue-500 shrink-0" size={28} />{sidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter uppercase whitespace-nowrap">PMS 센터</span>}</div>
        <nav className="flex-1 py-8 px-3 space-y-1 no-scrollbar overflow-y-auto">
          {COMPANY_MENU.map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === m.id ? 'bg-blue-600 shadow-xl shadow-blue-900/40 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}><m.icon size={20} className="shrink-0" /><span className={`text-sm whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{m.label}</span></button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={onLogout} className="flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-all w-full"><LogIn size={20} className="shrink-0" />{sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">보안 로그아웃</span>}</button></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 shadow-sm"><Menu size={20} /></button><SessionTimer initialTime={4800} onLogout={onLogout} isSandbox={isSandbox} /></div>
          <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><p className="text-sm font-black text-slate-800 uppercase italic">{isSandbox ? '익명 이용자 (체험)' : '보안 책임자 (대표님)'}</p><div className="flex justify-end items-center gap-1.5 mt-0.5"><span className={`w-1.5 h-1.5 ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></span><p className={`text-[9px] ${isSandbox ? 'text-amber-500' : 'text-emerald-500'} font-bold uppercase tracking-widest`}>{isSandbox ? '체험 계정' : '시스템 인증됨'}</p></div></div><div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-500 shadow-inner"><Users size={18} /></div></div>
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

  // 계정 폼 상태
  const [signupStep, setSignupStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authFetch = useCallback((url, options = {}) =>
    fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...(options.headers || {}) } }), [authToken]);

  const loadData = useCallback(() => {
    if (currentScreen === 'sandbox') {
      setDashStats({ total: 1240, today: 12, consentRate: 98 });
      setMemberRecords([{ id: '1', name: '홍길동(예시)', phone: '010-1234-5678', status: 'ENCRYPTED' }]);
      return;
    }
    authFetch('/api/admin/db/stats').then(r => r.ok && r.json().then(setDashStats));
    setMemberLoading(true); authFetch('/api/admin/records').then(r => r.ok && r.json().then(setMemberRecords)).finally(()=>setMemberLoading(false));
  }, [authFetch, currentScreen]);

  useEffect(() => { if ((currentScreen === 'company_admin' || currentScreen === 'sandbox') && (authToken || currentScreen === 'sandbox')) loadData(); }, [currentScreen, authToken, loadData]);

  const handleSendCode = async () => {
    if (!email) { setError('이메일을 입력하세요.'); return; }
    setLoading(true); try { const r = await fetch('/api/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); if (r.ok) setSignupStep('verify'); else setError('발송 실패'); } catch { setError('서버 오류'); } finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    setLoading(true); try { const r = await fetch('/api/auth/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code: verifyCode }) }); if (r.ok) setSignupStep('info'); else setError('인증 코드 불일치'); } catch { setError('서버 오류'); } finally { setLoading(false); }
  };

  const handleSignupComplete = async () => {
    setLoading(true); try { const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) }); const d = await r.json(); if (r.ok) { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentScreen('company_admin'); } else setError(d.error); } catch { setError('서버 오류'); } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setLoading(true); try { const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const d = await r.json(); if (r.ok) { localStorage.setItem('pms_token', d.token); setAuthToken(d.token); setCurrentScreen('company_admin'); } else setError(d.error); } catch { setError('서버 오류'); } finally { setLoading(false); }
  };

  return (
    <div className="selection:bg-blue-600 selection:text-white h-screen overflow-hidden bg-white font-['Noto_Sans_KR']">
      <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
        {currentScreen === 'landing' && <LandingView onNavigate={setCurrentScreen} />}
        {currentScreen === 'login' && (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-[440px] bg-white rounded-[4rem] shadow-2xl p-14 border border-slate-100 relative group">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => setCurrentScreen('landing')}><div className="bg-blue-600 p-4 rounded-3xl text-white mb-5 shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform"><Shield size={32} /></div><h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">보안 포털 접속</h2></div>
              <div className="space-y-6">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="보안 이메일 주소" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" />
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:border-blue-500 transition-all" />
                {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
                <button onClick={handleLogin} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98] uppercase italic">{loading ? '인증 중...' : '접속 승인 요청'}</button>
                <p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600 transition" onClick={()=>{setError(''); setSignupStep('email'); setCurrentScreen('signup');}}>신규 보안 워크스페이스 생성</p>
              </div>
            </div>
          </div>
        )}
        {currentScreen === 'signup' && (
          <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-[480px] bg-white rounded-[4rem] shadow-2xl p-16 border border-slate-100 relative">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12 text-center italic">워크스페이스 생성</h2>
              <div className="space-y-6 animate-in slide-in-from-bottom-5">
                {signupStep === 'email' && (<><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="회사 이메일 주소" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" /><button onClick={handleSendCode} disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-3"><Send size={20}/> 인증 코드 발송</button></>)}
                {signupStep === 'verify' && (<><div className="text-center space-y-2 mb-4"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{email}로 발송된 6자리 코드를 입력하십시오.</p></div><input type="text" value={verifyCode} onChange={e=>setVerifyCode(e.target.value)} maxLength="6" placeholder="000000" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-3xl font-black text-blue-600 outline-none" /><button onClick={handleVerifyCode} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 transition-all">코드 인증 완료</button><p className="text-center text-xs text-slate-300 cursor-pointer" onClick={()=>setSignupStep('email')}>이메일 재입력</p></>)}
                {signupStep === 'info' && (<><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="담당자 성명" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호 설정" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold" /><button onClick={handleSignupComplete} disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 transition-all uppercase italic">보안 워크스페이스 개설</button></>)}
                {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
                <p className="text-center text-slate-400 text-xs font-bold cursor-pointer hover:text-blue-600 transition mt-6" onClick={()=>{setError(''); setCurrentScreen('login');}}>이미 계정이 있습니까? 로그인</p>
              </div>
            </div>
          </div>
        )}
        {(currentScreen === 'company_admin' || currentScreen === 'sandbox') && (
          <CompanyAdminView 
            activeTab={activeTab} setActiveTab={setActiveTab} 
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
            onLogout={() => { localStorage.removeItem('pms_token'); setAuthToken(''); setCurrentScreen('login'); }} onNavigate={setCurrentScreen}
            dashStats={dashStats} memberRecords={memberRecords} memberLoading={memberLoading}
            handleDeleteRecord={(id) => { if(confirm('영구 파기하시겠습니까?')) authFetch(`/api/admin/records/${id}`, {method:'DELETE'}).then(()=>loadData()); }}
            onVaultComplete={async (data) => {
              if (currentScreen === 'sandbox') { alert('체험 모드에서는 저장이 지원되지 않습니다.'); return; }
              if (!data.records || data.records.length === 0) return;
              try { const r = await authFetch('/api/admin/records/batch', { method: 'POST', body: JSON.stringify({ records: data.records }) }); if (r.ok) loadData(); } catch { }
            }}
            isSandbox={currentScreen === 'sandbox'}
          />
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
