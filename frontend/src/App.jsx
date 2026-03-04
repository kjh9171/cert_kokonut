import React, { useState, useEffect, useMemo } from 'react';
// SecurityVault 독립 컴포넌트 임포트 (선택형 암호화 및 엑셀 처리 엔진)
import SecurityVault from './SecurityVault.jsx';
// 보안 및 UI 구성을 위한 아이콘 세트 (lucide-react)
import { 
  Shield, Users, Database, Key, FileText, Settings, 
  Bell, Search, Menu, X, Download, Plus, LayoutDashboard, 
  History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  ChevronRight, Lock, CheckCircle, AlertTriangle, UserPlus, LogIn, 
  ArrowLeft, Globe, Zap, Check, Activity, BarChart3, TrendingUp,
  Smartphone, EyeOff, Share2, Clock, ExternalLink, Scale, Info, FileSearch, Save, Trash2
} from 'lucide-react';
// 데이터 시각화를 위한 Recharts 라이브러리 (보안 모니터링용)
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// --- 전역 상수 및 설정 데이터 ---

// 기업 관리자용 메인 메뉴 구성
const COMPANY_MENU = [
  { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard },
  { id: 'member_db', label: '회원 DB 관리', icon: Database },
  { id: 'security_vault', label: '보안 금고 (암호화)', icon: Lock },
  { id: 'provision_status', label: '외부 제공 현황', icon: Share2 },
  { id: 'policy_manage', label: '약관/처리방침 관리', icon: Scale },
  { id: 'api_keys', label: 'API 연동관리', icon: Key },
  { id: 'subscription', label: '구독 관리', icon: CreditCard },
];

// 시스템 관리자(공급자) 전용 메뉴 구성
const SYSTEM_MENU = [
  { id: 'total_stats', label: '전체 통계', icon: BarChart3 },
  { id: 'company_manage', label: '고객사 관리', icon: Globe },
  { id: 'security_monitor', label: '보안 모니터링', icon: Activity },
  { id: 'billing_stats', label: '매출 현황', icon: TrendingUp },
  { id: 'system_settings', label: '시스템 설정', icon: Settings },
];

// 차트 시뮬레이션용 주간 트래픽 데이터
const CHART_DATA = [
  { name: '월', value: 400, api: 2400 },
  { name: '화', value: 300, api: 1398 },
  { name: '수', value: 600, api: 9800 },
  { name: '목', value: 800, api: 3908 },
  { name: '금', value: 500, api: 4800 },
];

// --- 법적 고지 전문 데이터 ---

// 1. 개인정보처리방침
const PRIVACY_POLICY_CONTENT = `
제1조(목적)
본 방침은 (주)개인정보관리서비스(이하 '회사')가 제공하는 PMS Center 서비스 이용과 관련하여 회사가 준수해야 할 개인정보 보호 지침을 규정합니다.

제2조(수집하는 개인정보 항목 및 수집방법)
회사는 서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집합니다.
1. 수집항목: 성명, 휴대전화번호, 이메일 주소, 회사명, 직함
2. 수집방법: 홈페이지 회원가입 및 서비스 이용 과정에서의 직접 입력

제3조(개인정보의 처리 목적)
1. 서비스 회원가입 및 관리: 이용자 식별, 가입의사 확인, 고객문의 응대
2. 서비스 제공 및 운영: 암호화 DB 관리, 컴플라이언스 자동화 리포트 생성
3. 보안 강화: 부정한 이용 방지 및 2차 인증(OTP) 처리

제4조(개인정보의 보유 및 이용기간)
이용자의 개인정보는 원칙적으로 서비스 탈퇴 시 지체 없이 파기합니다. 다만 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 안전하게 보관합니다.
`;

// 2. 서비스 이용약관
const TERMS_OF_SERVICE_CONTENT = `
제1조(목적)
본 약관은 PMS Center가 제공하는 모든 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.

제2조(용어의 정의)
1. '이용자'란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원(기업 관리자)을 말합니다.
2. '서비스'란 회사가 구현한 개인정보 암호화 및 관리 자동화 솔루션을 의미합니다.

제3조(이용계약의 성립)
이용계약은 이용자가 약관 내용에 동의하고 가입 신청을 한 후 회사가 이를 승낙함으로써 성립합니다.

제4조(서비스 요금)
서비스 요금은 회사와 이용자 간 체결한 구독 플랜 및 개인정보 보관 건당 과금 체계에 따릅니다.
`;

// 3. 쿠키정책
const COOKIE_POLICY_CONTENT = `
본 서비스는 이용자의 편의를 위해 쿠키를 사용합니다. 쿠키는 웹사이트 운영에 필요한 최소한의 텍스트 파일로, 이용자의 브라우저에 저장됩니다.

1. 필수 쿠키: 로그인 세션 유지 및 보안 인증을 위해 반드시 필요합니다.
2. 성능 쿠키: 서비스 이용 행태를 분석하여 성능을 개선하는 데 사용됩니다.
3. 쿠키 설정 거부: 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.
`;

export default function App() {
  // --- 공통 상태 관리 ---
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [activePolicy, setActivePolicy] = useState('privacy');
  const [authStep, setAuthStep] = useState('credentials');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timer, setTimer] = useState(4800);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agreed, setAgreed] = useState({ terms: false, privacy: false, marketing: false });
  // 암호화 처리 결과를 회원DB 탭에 연동하기 위한 저장소
  const [encryptedRecords, setEncryptedRecords] = useState([]);

  // 보안 금고에서 암호화 완료 시 호출되는 콜백
  const handleVaultComplete = (result) => {
    setEncryptedRecords(prev => [result, ...prev]);
  };

  // 약관 전체동의 토글 핸들러
  const handleAgreeAll = (checked) => {
    setAgreed({ terms: checked, privacy: checked, marketing: checked });
  };

  // 세션 타이머 작동 엔진 (80분 기준 자동 로그아웃 감시)
  useEffect(() => {
    let interval;
    if (currentScreen === 'company_admin' || currentScreen === 'system_admin') {
      interval = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen]);

  // 시간 포맷 변환 (MM:SS)
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
  };

  // --- 화면별 뷰 컴포넌트 정의 ---

  // I. 랜딩 페이지 (LandingView)
  const LandingView = () => (
    <div className="min-h-screen bg-white animate-in fade-in duration-700">
      <nav className="fixed top-0 w-full h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentScreen('landing')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Shield size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">PMS Center</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setCurrentScreen('login')} className="text-sm font-bold text-slate-600 px-4 hover:text-blue-600 transition">로그인</button>
          <button onClick={() => setCurrentScreen('signup')} className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">무료 시작</button>
        </div>
      </nav>

      <main className="pt-40 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest mb-8 uppercase">
            <Zap size={14} fill="currentColor" /> Trust & Security First
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
            개인정보 보호,<br /><span className="text-blue-600">자동화</span>의 시대입니다.
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed max-w-2xl mx-auto">
            복잡한 컴플라이언스 대응부터 데이터 암호화 보관까지,<br />
            기업의 보안 리스크를 단 하나의 플랫폼으로 해결하세요.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setCurrentScreen('signup')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">지금 바로 도입하기</button>
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
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8 opacity-50">
            <Shield size={24} className="text-slate-900" />
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">PMS Center</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">
            <span onClick={() => { setCurrentScreen('policy_view'); setActivePolicy('privacy'); }} className="cursor-pointer hover:text-blue-600 transition-colors">개인정보처리방침</span>
            <span onClick={() => { setCurrentScreen('policy_view'); setActivePolicy('terms'); }} className="cursor-pointer hover:text-blue-600 transition-colors">이용약관</span>
            <span onClick={() => { setCurrentScreen('policy_view'); setActivePolicy('cookie'); }} className="cursor-pointer hover:text-blue-600 transition-colors">쿠키정책</span>
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-[10px] font-bold tracking-tight uppercase">주식회사 개인정보관리서비스 | 대표이사: 대표님 | 사업자번호: 000-00-00000</p>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.1em]">© 2026 PMS CENTER INC. SECURED BY CERT TEAM. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // II. 법적 고지 전문 보기 (PolicyView)
  const PolicyView = () => {
    const policyData = useMemo(() => {
      switch (activePolicy) {
        case 'privacy': return { title: '개인정보처리방침', content: PRIVACY_POLICY_CONTENT, version: 'v2.4.1' };
        case 'terms': return { title: '서비스 이용약관', content: TERMS_OF_SERVICE_CONTENT, version: 'v1.1.0' };
        case 'cookie': return { title: '쿠키정책', content: COOKIE_POLICY_CONTENT, version: 'v1.0.0' };
        default: return { title: '', content: '', version: '' };
      }
    }, [activePolicy]);

    return (
      <div className="min-h-screen bg-white animate-in slide-in-from-right-10 duration-500">
        <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50">
          <button onClick={() => setCurrentScreen('landing')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-xs uppercase tracking-widest transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div className="flex items-center gap-4">
            <h1 className="font-black text-slate-900 tracking-tight text-xl">{policyData.title}</h1>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest">{policyData.version}</span>
          </div>
          <button onClick={() => window.print()} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-2 font-black italic"><Download size={14} /> PDF 저장/인쇄</button>
        </header>
        <main className="max-w-4xl mx-auto py-24 px-8 leading-loose text-slate-700">
          <div className="bg-white rounded-[3rem] p-16 border border-slate-100 shadow-2xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-10 right-10 opacity-5">
              <ShieldCheck size={120} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-12 tracking-tighter border-b border-slate-100 pb-8">{policyData.title}</h2>
            <div className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-base tracking-tight text-slate-600 leading-relaxed font-medium">
                {policyData.content}
              </pre>
            </div>
          </div>
          <div className="mt-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Info size={14} /> Last Revised: 2026.03.04 | Managed by PMS Center Security Team
          </div>
        </main>
      </div>
    );
  };

  // III. 기업 관리자 모드 (CompanyAdminView)
  const CompanyAdminView = () => {
    // 내부 탭별 컴포넌트 렌더링
    const renderContent = () => {
      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-end">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Operations Center</h2>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 서버 상태: <span className="text-emerald-500 uppercase">Optimal</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { l: '보관 데이터', v: '1,284', c: 'text-blue-600', i: Database },
                  { l: '동의 완료율', v: '98%', c: 'text-emerald-600', i: ShieldCheck },
                  { l: '외부공유 건수', v: '23', c: 'text-indigo-600', i: Share2 },
                  { l: '남은 구독일', v: '184', c: 'text-amber-600', i: CreditCard },
                ].map((s, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-900/5 group">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 w-fit mb-6 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><s.i size={20} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                    <p className={`text-3xl font-black ${s.c} italic`}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-96">
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-2"><Activity size={18} className="text-blue-600" /> API Traffic Trace</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorDashboard" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDashboard)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-500 transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner animate-bounce group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Lock size={32} />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-lg mb-2 italic">Security Node</h3>
                  <p className="text-slate-400 text-sm font-medium">모든 데이터는 AES-256 방식으로<br />안전하게 암호화 보관 중입니다.</p>
                </div>
              </div>
            </div>
          );
        case 'security_vault':
          // 선택형 암호화 및 엑셀 보안 처리 모듈 렌더링 (결과를 회원DB에 연동)
          return <SecurityVault onProcessComplete={handleVaultComplete} />;
        case 'member_db':
          return (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              {/* 기존 회원 DB */}
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase">Member Database</h3>
                  <button onClick={() => setActiveTab('security_vault')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase italic"><Plus size={16} /> 엑셀 업로드 (보안 금고)</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-50">
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">성명</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">연락처</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">저장일시</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">보안상태</th>
                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { n: '홍길동', p: '010-1***-2***', d: '2026.03.04 14:22', s: 'Encrypted' },
                        { n: '임꺽정', p: '010-9***-0***', d: '2026.03.04 16:05', s: 'Encrypted' },
                        { n: '이순신', p: '010-5***-7***', d: '2026.03.04 17:11', s: 'Encrypted' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors uppercase font-bold text-sm text-slate-700 italic">
                          <td className="py-5 px-6">{row.n}</td>
                          <td className="py-5 px-6 tabular-nums">{row.p}</td>
                          <td className="py-5 px-6 tabular-nums">{row.d}</td>
                          <td className="py-5 px-6"><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] uppercase font-black">{row.s}</span></td>
                          <td className="py-5 px-6 text-right flex justify-end gap-3 text-slate-400">
                            <Eye size={18} className="cursor-pointer hover:text-blue-600" />
                            <Trash2 size={18} className="cursor-pointer hover:text-rose-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 보안 금고에서 처리된 암호화 결과 연동 */}
              {encryptedRecords.length > 0 && (
                <div className="bg-white rounded-[3rem] p-10 border border-emerald-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 italic uppercase mb-6 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-500" /> 보안 처리 완료 데이터
                  </h3>
                  <div className="space-y-4">
                    {encryptedRecords.map((rec, idx) => (
                      <div key={idx} className="bg-emerald-50/50 rounded-2xl border border-emerald-100 overflow-hidden">
                        <div className="p-5 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Lock size={18} /></div>
                            <div>
                              <p className="font-black text-slate-800 text-sm italic">{rec.filename}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rec.cipher} · {rec.totalRows}행 {rec.totalCells}셀 · {rec.timestamp}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] uppercase font-black">Secured</span>
                            <Download size={16} className="text-slate-400 cursor-pointer hover:text-blue-600 transition" />
                          </div>
                        </div>
                        {/* 처리 결과 미리보기 (헤더 + 첫 3행) */}
                        {rec.data && rec.data.length > 0 && (
                          <div className="border-t border-emerald-100 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px]">
                              <thead className="bg-emerald-50">
                                <tr>
                                  {rec.header.map((h, ci) => (
                                    <th key={ci} className={`py-2 px-3 font-black uppercase tracking-wider whitespace-nowrap ${rec.selectedCols.includes(ci) ? 'text-emerald-700' : 'text-slate-400'}`}>{h || `Col ${ci+1}`}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-emerald-50/50">
                                {rec.data.slice(0, 3).map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="py-2 px-3 font-medium whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis text-slate-600">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="bg-white p-24 rounded-[3.5rem] border border-dashed border-slate-200 text-center animate-in zoom-in duration-300 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
                <Settings size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tighter italic">{activeTab} In Progress</h3>
              <p className="text-slate-400 font-medium leading-relaxed">대표님, 해당 모듈은 현재 기획안 v2.0에 맞춰<br />보안 프로토콜 검수 및 실구현 단계에 있습니다. 충성!</p>
              <button onClick={() => setActiveTab('dashboard')} className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition text-xs uppercase tracking-widest">Back to Dashboard</button>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-[#f8fafc] flex animate-in fade-in duration-700 overflow-hidden">
        <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="h-20 flex items-center px-6 border-b border-slate-800 cursor-pointer overflow-hidden" onClick={() => setCurrentScreen('landing')}>
            <Shield className="text-blue-500 shrink-0" size={28} />
            {sidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter uppercase whitespace-nowrap">PMS Center</span>}
          </div>
          <nav className="flex-1 py-8 px-3 space-y-1 no-scrollbar overflow-y-auto overflow-x-hidden">
            {COMPANY_MENU.map((m) => (
              <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === m.id ? 'bg-blue-600 shadow-xl shadow-blue-900/40 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                <m.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{m.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-800">
            <button onClick={() => setCurrentScreen('login')} className="flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-all w-full">
              <LogIn size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors border border-slate-100 shadow-sm"><Menu size={20} /></button>
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-inner">
                <Clock size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest hidden sm:inline">Session Remaining</span>
                <span className="text-sm font-black text-blue-600 tabular-nums">{formatTime(timer)}</span>
                <button onClick={() => setTimer(4800)} className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded ml-2 hover:bg-blue-700 transition shadow-sm border border-blue-500">연장</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 uppercase italic">Master Admin (대표님)</p>
                <div className="flex justify-end items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Security Authenticated</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-slate-200 shadow-inner bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                <Users size={18} />
              </div>
            </div>
          </header>
          <main className="flex-1 p-10 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar">
            {renderContent()}
          </main>
        </div>
      </div>
    );
  };

  // IV. 통합 관제 센터 (SystemAdminView - 다크 모드)
  const SystemAdminView = () => (
    <div className="min-h-screen bg-slate-950 flex animate-in fade-in duration-700 overflow-hidden">
      <aside className={`bg-black text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-24 flex items-center px-8 border-b border-white/5 overflow-hidden">
          <Activity className="text-emerald-500 shrink-0" size={28} />
          {sidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter text-white whitespace-nowrap uppercase italic">System Ops</span>}
        </div>
        <nav className="flex-1 py-10 px-4 space-y-1 overflow-x-hidden no-scrollbar">
          {SYSTEM_MENU.map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === m.id ? 'bg-emerald-600 shadow-xl shadow-emerald-900/20 font-bold text-white' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
              <m.icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm px-2 whitespace-nowrap">{m.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => setCurrentScreen('landing')} className="flex items-center gap-4 p-4 text-slate-600 hover:text-white transition-all w-full">
            <Globe size={20} className="shrink-0" />
            {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Open Portal</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        <header className="h-24 border-b border-white/5 px-10 flex justify-between items-center sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 text-white/40 text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> 
            Global Node: Seoul Central OPS
          </div>
          <div className="flex items-center gap-6 text-white/60">
            <div className="p-3 bg-white/5 text-white/40 rounded-2xl hover:text-white transition cursor-pointer border border-white/5"><Bell size={20} /></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white italic">CERT 총괄 관리자</p>
                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-1">Super User Level</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-lg"><Shield size={24} /></div>
            </div>
          </div>
        </header>

        <main className="p-12 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Control Room</h2>
              <p className="text-slate-500 mt-2 font-medium">전체 서비스 네트워크 및 고도화 인프라 자원을 실시간 감시합니다.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 text-center min-w-[160px]">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-widest">Monthly MRR</p>
                <p className="text-xl font-black text-white italic">₩1.42B</p>
              </div>
              <div className="bg-emerald-500/10 px-6 py-4 rounded-3xl border border-emerald-500/20 text-center min-w-[160px]">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Active nodes</p>
                <p className="text-xl font-black text-emerald-400 italic">24,582</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-10 flex items-center gap-3 uppercase italic tracking-tight"><Activity size={18} className="text-emerald-500" /> System Traffic Trace-Log</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px', color: '#fff' }} />
                    <Area type="monotone" dataKey="api" stroke="#10b981" fillOpacity={1} fill="url(#colorSys)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between shadow-2xl">
              <div>
                <h3 className="text-lg font-black text-white mb-8 italic uppercase tracking-tight">Node Integrity</h3>
                <div className="space-y-6">
                  {[
                    { n: 'Main API Node', v: 98, c: 'text-emerald-500' },
                    { n: 'Database Cluster', v: 42, c: 'text-amber-500' },
                    { n: 'Encryption HSM', v: 12, c: 'text-emerald-500' },
                  ].map((s, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-widest italic">
                        <span className="text-slate-500">{s.n}</span>
                        <span className={s.c}>{s.v}% Load</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-current ${s.c} transition-all duration-1000`} style={{ width: `${s.v}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center group cursor-pointer hover:bg-emerald-500/10 transition-all">
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Security Status</p>
                <p className="text-sm font-black text-emerald-400 uppercase italic">All Nodes Optimal</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  // --- 조건부 메인 렌더링 시스템 ---
  return (
    <div className="selection:bg-blue-600 selection:text-white no-scrollbar">
      {currentScreen === 'landing' && <LandingView />}
      {currentScreen === 'login' && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-[440px] bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] p-14 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="flex flex-col items-center mb-12 cursor-pointer" onClick={() => setCurrentScreen('landing')}>
              <div className="bg-blue-600 p-4 rounded-3xl text-white mb-5 shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Admin Portal</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Security Verification Required</p>
            </div>
            {authStep === 'credentials' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="space-y-4">
                  <input type="email" placeholder="admin@pms-center.com" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                  <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all" />
                </div>
                <button onClick={() => setAuthStep('otp')} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase italic tracking-tighter">Request Access</button>
                <div className="text-center">
                  <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Demo access password: 1234</span>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">2rd Authenticator</h3>
                  <p className="text-slate-400 text-xs font-medium italic">이메일/OTP로 전송된 6자리 번호를 입력하십시오.</p>
                </div>
                <div className="flex justify-between gap-3 px-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => <input key={i} type="text" maxLength="1" className="w-12 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black text-blue-600 focus:ring-4 focus:ring-blue-100 outline-none shadow-inner border-b-4 border-b-blue-500/20" />)}
                </div>
                <div className="space-y-4">
                  <button onClick={() => { setCurrentScreen('company_admin'); setTimer(4800); }} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-[0.98] uppercase italic">Grant Authentication</button>
                  <button onClick={() => { setCurrentScreen('system_admin'); setTimer(4800); }} className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all uppercase tracking-[0.2em] italic">System Monitor Mode (Demo)</button>
                </div>
                <p onClick={() => setAuthStep('credentials')} className="text-center text-xs font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-widest">← Back to Credentials</p>
              </div>
            )}
          </div>
        </div>
      )}
      {currentScreen === 'policy_view' && <PolicyView />}
      {currentScreen === 'company_admin' && <CompanyAdminView />}
      {currentScreen === 'signup' && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-[560px] bg-white rounded-[4rem] shadow-[0_50px_120px_rgba(0,0,0,0.06)] p-16 border border-slate-100 relative">
             <div className="absolute top-0 right-10 bg-blue-600 text-white px-4 py-2 rounded-b-2xl text-[10px] font-black uppercase tracking-[0.2em] italic">v2.0 Beta</div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12 text-center italic">Initialize Account</h2>
            <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6 mb-12 shadow-inner">
              <label className="flex items-center gap-4 text-base font-black text-slate-800 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={agreed.terms && agreed.privacy && agreed.marketing} onChange={(e) => handleAgreeAll(e.target.checked)} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer transition-all" />
                </div>
                모든 보안 약관 및 방침에 동의합니다.
              </label>
              <div className="h-[1px] bg-slate-200 my-4"></div>
              {[
                { id: 'terms', text: '서비스 이용약관 동의 (필수)', link: 'terms' },
                { id: 'privacy', text: '개인정보처리방침 동의 (필수)', link: 'privacy' },
                { id: 'marketing', text: '마케팅 정보 수신 동의 (선택)', link: null },
              ].map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <label className="flex items-center gap-3 text-sm font-bold text-slate-500 cursor-pointer group-hover:text-slate-800 transition-colors">
                    <input type="checkbox" checked={agreed[item.id]} onChange={() => setAgreed(prev => ({...prev, [item.id]: !prev[item.id]}))} className="w-4 h-4 rounded border-slate-200 text-blue-600" /> {item.text}
                  </label>
                  {item.link && (
                    <div onClick={() => { setCurrentScreen('policy_view'); setActivePolicy(item.link); }} className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-all cursor-pointer">
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setCurrentScreen('company_admin')} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] uppercase italic tracking-tighter">Create Secured Workspace</button>
            <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-500 italic" onClick={() => setCurrentScreen('login')}>Already have an account? Access Portal</p>
          </div>
        </div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        body { font-family: 'Noto Sans KR', sans-serif; overflow-x: hidden; color: #1e293b; background: white; -webkit-font-smoothing: antialiased; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
        ::selection { background: #3b82f6; color: white; }
        input::placeholder { color: #cbd5e1; font-weight: 500; }
        pre { font-family: inherit; }
        @media print { header, aside, button { display: none !important; } .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; } .bg-white { background: white !important; } .shadow-2xl { box-shadow: none !important; } .border { border: none !important; } }
      `}</style>
    </div>
  );
}
