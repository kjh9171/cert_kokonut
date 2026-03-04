import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Shield, Users, Database, Key, FileText, Settings, 
  Bell, Search, Menu, X, Download, Plus, LayoutDashboard, 
  History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  PlusCircle, Activity, LogOut, Lock, ChevronDown, ChevronRight,
  ClipboardList, MessageSquare, AlertCircle, Bookmark
} from 'lucide-react';
// 통계 시각화를 위한 차트 라이브러리
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- [공통 보조 컴포넌트: 전술 통계 카드] ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`${colorClass} p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform"><Icon size={80} /></div>
    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black italic">{value}</span>
        <span className="text-xs font-bold opacity-60">건</span>
      </div>
    </div>
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

// --- [보조 컴포넌트: 인증 화면] ---
const AuthScreen = ({ isSignup, setIsSignup, handleAuthAction, authError }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
    <div className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl p-16 animate-in zoom-in duration-700">
      <div className="flex justify-center mb-10 text-blue-600"><Shield size={80} /></div>
      <h2 className="text-4xl font-black text-center text-slate-900 mb-2 italic tracking-tighter uppercase">KOKONUT PMS</h2>
      <p className="text-center text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs italic">고도의 보안이 요구되는 관리 구역입니다.</p>
      
      <div className="space-y-6">
        {isSignup && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">성함 / 요원 명칭</label>
            <input id="auth-name" placeholder="홍길동" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
          </div>
        )}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">보안 아이디 (ID)</label>
          <input id="auth-email" placeholder="example@cert.com" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">보안 암호 (PASSWORD)</label>
          <input id="auth-password" type="password" placeholder="••••••••" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold" />
        </div>
        
        {authError && <p className="text-rose-500 text-center font-black text-xs uppercase italic animate-bounce">{authError}</p>}
        
        <button onClick={handleAuthAction} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl mt-6 uppercase tracking-tighter italic">
          {isSignup ? '요원 등록 승인' : '시스템 접속 승인'}
        </button>
        <button onClick={() => setIsSignup(!isSignup)} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 mt-4 underline decoration-double underline-offset-4">
          {isSignup ? '이미 계정이 있습니까? 로그인' : '신규 요원 계정 등록 (Signup)'}
        </button>
      </div>
    </div>
  </div>
);

// --- [기업 관리자용: 상세 대시보드 뷰 (새 이미지 기반)] ---
const UserDashboardView = ({ user, stats }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 개인정보 수집 홍보 카드 */}
        <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100 flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
          <div className="space-y-6">
            <h3 className="text-2xl font-black italic text-slate-900 leading-tight">개인정보를 수집하고 싶다면?<br/><span className="text-blue-600">캐치폼</span>으로 한번에 해결하세요!</h3>
            <p className="text-sm font-bold text-slate-400">수집부터 관리까지 완벽한 자동화 프로세스</p>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">캐치폼 생성</button>
          </div>
          <div className="hidden md:block w-32 h-32 bg-orange-100 rounded-[32px] flex items-center justify-center text-orange-500"><ClipboardList size={64} /></div>
        </div>
        
        {/* 라이선스 현황 카드 */}
        <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100 group">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-black italic text-slate-900 uppercase">라이선스</h3>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-600">자세히 보기 <ChevronRight size={12} /></button>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="text-blue-600 font-black italic">무료이용권</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase">이용중</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">시작일</p>
                <p className="font-black italic text-slate-800">2026.03.04</p>
              </div>
              <div className="p-4 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">종료일</p>
                <p className="font-black italic text-slate-800">2026.03.10</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 응답 정보 보관량 통계 */}
      <div className="bg-white p-12 rounded-[48px] shadow-xl border border-slate-100">
        <h3 className="text-2xl font-black italic text-slate-900 mb-10 flex items-center gap-3">응답 정보 보관량 <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full px-2 italic uppercase">기본 제공 사용중</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">당월</p>
            <p className="text-5xl font-black italic text-slate-900 group-hover:scale-110 transition-transform">0<span className="text-xl ml-1">건</span></p>
          </div>
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">전월 이월</p>
            <p className="text-5xl font-black italic text-slate-900 group-hover:scale-110 transition-transform">0<span className="text-xl ml-1">건</span></p>
          </div>
          <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:border-blue-500 transition-all duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">합계</p>
            <p className="text-5xl font-black italic text-slate-900 group-hover:scale-110 transition-transform">0<span className="text-xl ml-1">건</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-white"><Shield size={48} /></div>
            <div>
              <p className="text-sm font-bold opacity-80 mb-2 italic uppercase tracking-tighter">개인정보의 안전한 수집/관리를 위한</p>
              <h4 className="text-2xl font-black italic uppercase">개인정보 수명관리</h4>
            </div>
          </div>
          <div className="mt-8 flex justify-between items-end relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">관리 개인정보 기본: <span className="text-sm opacity-100">1,000 건</span></div>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50 transition active:scale-95">바로가기</button>
          </div>
          <Shield size={200} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
        </div>
        <div className="p-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-white"><FileText size={48} /></div>
            <div>
              <p className="text-sm font-bold opacity-80 mb-2 italic uppercase tracking-tighter">동의서 및 처리방침을 쉽게 만들 수 있는</p>
              <h4 className="text-2xl font-black italic uppercase">처리방침 관리</h4>
            </div>
          </div>
          <div className="mt-8 relative z-10 flex justify-end">
            <button className="px-6 py-3 bg-white text-blue-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50 transition active:scale-95">바로가기</button>
          </div>
          <FileText size={200} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// --- [기업 관리자용: 회사 기본 정보 뷰] ---
const CompanyInfoView = ({ user }) => {
  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">회사 기본 정보</h3>
        <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-blue-700 transition shadow-xl shadow-blue-200">수정</button>
      </div>
      <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">회사명</p>
              <p className="text-xl font-black italic text-slate-900 underline decoration-slate-200 underline-offset-8 decoration-2">{user?.company || 'PMS'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">회사 주소</p>
              <p className="text-xl font-black italic text-slate-900 opacity-30 italic">- (지정되지 않음)</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">사업자 등록증</p>
              <p className="text-xl font-black italic text-slate-900 opacity-30 italic">첨부파일 없음</p>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">세금계산서 담당자명</p>
              <p className="text-xl font-black italic text-slate-900 underline decoration-slate-200 underline-offset-8 decoration-2">{user?.name || '관리자'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">세금계산서 발행 이메일</p>
              <p className="text-xl font-black italic text-slate-900 underline decoration-slate-200 underline-offset-8 decoration-2">{user?.email || 'pms@example.com'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">추천인 코드</p>
              <p className="text-xl font-black italic text-slate-900 opacity-30 italic">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [기업 관리자용: 결제 수단 관리 뷰] ---
const PaymentMethodView = () => {
  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      <div className="space-y-2">
        <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">결제 수단 관리</h3>
        <p className="text-sm font-bold text-slate-400">구독 및 부가 서비스의 결제 수단을 추가 및 삭제하고 대표 결제 수단을 등록할 수 있습니다.</p>
      </div>
      <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-slate-100">
        <h4 className="text-xl font-black italic text-slate-900 mb-10">결제 수단</h4>
        <div className="max-w-xl p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] text-center space-y-8">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-slate-300 shadow-sm"><CreditCard size={32} /></div>
          <div>
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><ShieldCheck size={14} /> 크레딧</p>
            <h5 className="text-3xl font-black italic text-slate-900">크레딧을 충전해 주세요</h5>
          </div>
          <div className="flex justify-center gap-4">
             <button className="px-6 py-2 bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase italic tracking-tighter shadow-sm flex items-center gap-1"><ShieldCheck size={12} /> 대표 결제수단</button>
          </div>
          <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase italic hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95">크레딧 충전</button>
        </div>
      </div>
    </div>
  );
};

// --- [기업 관리자용: 외부 공유받은 개인정보 열람 뷰] ---
const ExternalSharedView = () => {
  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700 pb-20">
      <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">외부 공유받은 개인정보 열람</h3>
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 bg-slate-50 border-b flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="캐치폼·개인정보 업로드 명 입력" className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:border-blue-500 outline-none shadow-sm transition-all" />
          </div>
          <button className="px-12 py-5 bg-white border-2 border-slate-100 bg-white rounded-2xl font-black text-sm uppercase italic hover:bg-slate-50 transition shadow-sm active:scale-95">검색</button>
        </div>
        <div className="p-8 border-b">
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>전체 <span className="text-blue-600">0개</span></span>
            <span className="opacity-20">|</span>
            <span>전체 개인정보 <span className="text-blue-600">0건</span></span>
            <span className="opacity-20">|</span>
            <span>유효 개인정보 <span className="text-blue-600">0건</span></span>
            <span className="opacity-20">|</span>
            <span>철회 개인정보 <span className="text-slate-900">0건</span></span>
          </div>
        </div>
        <div className="p-32 text-center space-y-6">
          <div className="w-32 h-32 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-100"><Database size={64} /></div>
          <p className="text-slate-300 font-bold italic">데이터가 없습니다</p>
        </div>
        <div className="p-8 border-t flex justify-between items-center">
          <div className="flex items-center gap-4">
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black outline-none italic">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30" disabled><ChevronDown className="rotate-90" size={16} /></button>
            <button className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [사이드바 하위 메뉴 아이템] ---
const SidebarSubItem = ({ id, label, onClick, activeTab }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full text-left pl-14 pr-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group
      ${activeTab === id ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}
  >
    {activeTab === id && <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>}
    <span className="group-hover:translate-x-1 transition-transform inline-block">{label}</span>
  </button>
);

// --- [메인 애플리케이션 컴포넌트] ---
export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cert_pms_user')) || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openGroups, setOpenGroups] = useState({ management: true });
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState('');
  const [privacyRecords, setPrivacyRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 });

  useEffect(() => {
    if (user) fetchSecurityData();
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      const res = await fetch('/api/admin/records');
      const data = await res.json();
      setPrivacyRecords(data || []);
      setStats({
        total: (data || []).length,
        today: (data || []).filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length,
        alerts: 2
      });
    } catch (e) { console.error(e); }
  };

  const handleAuthAction = async () => {
    setLoading(true);
    setAuthError('');
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = isSignup ? document.getElementById('auth-name').value : '';
    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('cert_pms_token', data.token);
      localStorage.setItem('cert_pms_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (e) { setAuthError(e.message); } finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('cert_pms_token');
    localStorage.removeItem('cert_pms_user');
    setUser(null);
  };

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen isSignup={isSignup} setIsSignup={setIsSignup} handleAuthAction={handleAuthAction} authError={authError} />;

  // 이미지 기반 계층형 메뉴 데이터
  const menuGroups = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, single: true },
    { id: 'collection', label: '개인정보 수집/관리', icon: Database, items: [
      { id: 'catchform', label: '캐치폼·업로드 목록' },
      { id: 'ad_consent', label: '광고성 정보 수신동의 관리' },
      { id: 'fixed_url', label: '고정 URL 관리' }
    ]},
    { id: 'consent_policy', label: '동의서&처리방침', icon: ShieldCheck, items: [
      { id: 'consent_gen', label: '동의서 생성' },
      { id: 'consent_list', label: '동의서 목록' },
      { id: 'policy_mgmt', label: '처리방침 관리' }
    ]},
    { id: 'sms', label: '문자 서비스', icon: MessageSquare, items: [
       { id: 'sms_send', label: '문자 발송' },
       { id: 'sms_list', label: '발송 내역' }
    ]},
    { id: 'email', label: '이메일 서비스', icon: Mail, items: [
       { id: 'email_send', label: '이메일 발송' },
       { id: 'email_list', label: '발송 내역' }
    ]},
    { id: 'notification', label: '알림 서비스', icon: Bell, items: [
       { id: 'alert_recv', label: '알림 받기' }
    ]},
    { id: 'management', label: '관리', icon: Settings, items: [
      { id: 'company_info', label: '회사 기본 정보' },
      { id: 'policy_ctrl', label: '회사 정책 관리' },
      { id: 'service_ctrl', label: '서비스 관리' },
      { id: 'member_ctrl', label: '구성원 관리' }
    ]},
    { id: 'monitoring', label: '개인정보 모니터링', icon: Activity, items: [
      { id: 'privacy_log', label: '개인정보 처리로그' },
      { id: 'ad_log', label: '수신동의 처리로그' }
    ]},
    { id: 'license', label: '라이선스', icon: CreditCard, items: [
      { id: 'subs_mgmt', label: '구독 및 서비스 관리' },
      { id: 'payment_mgmt', label: '결제 수단 관리' },
      { id: 'billing_list', label: '결제 내역' }
    ]},
    { id: 'external_shared', label: '외부 공유받은 개인정보 열람', icon: Users, single: true },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900 overflow-hidden">
      {/* 고도화된 계층형 사이드바 (v2.0) */}
      <aside className="w-80 bg-white border-r flex flex-col shadow-sm relative z-20">
        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between group">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform"><Shield size={20} /></div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">서비스명</p>
               <h1 className="text-xl font-black italic tracking-tighter text-slate-900">PMS</h1>
             </div>
          </div>
          <button className="text-slate-300 hover:text-blue-500 transition-colors"><Search size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {menuGroups.map(group => (
            <div key={group.id} className="space-y-1">
              {group.single ? (
                <button 
                  onClick={() => setActiveTab(group.id)} 
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] uppercase transition-all tracking-widest
                    ${activeTab === group.id ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <group.icon size={18} /> {group.label}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => toggleGroup(group.id)} 
                    className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[10px] uppercase transition-all tracking-widest
                      ${openGroups[group.id] ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    <div className="flex items-center gap-4">
                      <group.icon size={18} /> {group.label}
                    </div>
                    {openGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {openGroups[group.id] && (
                    <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                      {group.items.map(sub => (
                        <SidebarSubItem 
                          key={sub.id} 
                          id={sub.id} 
                          label={sub.label} 
                          activeTab={activeTab} 
                          onClick={setActiveTab} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* 사이드바 하위 고객지원 섹션 */}
        <div className="p-8 border-t space-y-4 bg-slate-50/30">
          <button className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-3 hover:border-blue-500 transition-colors shadow-sm active:scale-95">
             <Activity size={14} className="text-orange-500 animate-pulse" /> 캐치시큐 업데이트 노트
          </button>
          <button className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-3 hover:border-blue-500 transition-colors shadow-sm active:scale-95">
             <HelpCircle size={14} className="text-blue-500" /> 캐치시큐 헬프센터
          </button>
          <div className="flex justify-between px-2 pt-2 text-[8px] font-black uppercase text-slate-300 tracking-widest">
            <span className="hover:text-slate-600 pointer-cursor">홈페이지</span>
            <span className="hover:text-slate-600 pointer-cursor">개인정보처리방침</span>
            <span className="hover:text-slate-600 pointer-cursor">이용약관</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50/30 relative">
        <header className="bg-white/80 backdrop-blur-md border-b p-8 px-12 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Database size={24} /></div>
             <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex gap-4">
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><MessageSquare size={20} /></button>
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><ShieldCheck size={20} /></button>
            </div>
            <div className="h-10 w-[1px] bg-slate-100 italic"></div>
            <div className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 italic">대표님 <span className="text-[10px] text-blue-500 opacity-60">MY</span></p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Security Group</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                 <Users size={24} className="opacity-50" />
                 <div className="absolute inset-0 bg-blue-600/20 active:bg-blue-600/40 transition-colors"></div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-12 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <UserDashboardView user={user} stats={stats} />}
          {activeTab === 'company_info' && <CompanyInfoView user={user} />}
          {activeTab === 'payment_mgmt' && <PaymentMethodView />}
          {activeTab === 'external_shared' && <ExternalSharedView />}
          
          {/* 미구현 섹션용 고품격 플레이스홀더 */}
          {!['dashboard', 'company_info', 'payment_mgmt', 'external_shared'].includes(activeTab) && (
            <div className="py-40 text-center space-y-8 animate-in zoom-in duration-700">
               <div className="relative inline-block">
                 <Lock size={120} className="text-slate-100 mx-auto" />
                 <AlertCircle size={40} className="text-blue-500 absolute -bottom-2 -right-2 animate-bounce" />
               </div>
               <div className="space-y-3">
                 <h3 className="text-4xl font-black text-slate-200 uppercase italic tracking-tighter">{activeTab} MODULE</h3>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">현장 보안 검수 및 정밀 튜닝 진행 중</p>
               </div>
               <button onClick={() => setActiveTab('dashboard')} className="px-10 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95 flex items-center gap-3 mx-auto">
                 <LayoutDashboard size={14} /> 관제실로 복구
               </button>
            </div>
          )}
        </section>

        {/* 전술적 하단 풋터 */}
        <footer className="px-12 py-10 border-t bg-white flex justify-between items-center text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
           <div className="flex gap-10">
             <span className="hover:text-slate-900 transition-colors">시스템 상태: 정상</span>
             <span className="hover:text-slate-900 transition-colors">데이터 암호화: AES-256</span>
             <span className="hover:text-slate-900 transition-colors">최종 무결성 확인: 방금 전</span>
           </div>
           <div>© 2026 KOKONUT PMS CORP. ALL RIGHTS RESERVED.</div>
        </footer>
      </main>
    </div>
  );
}
