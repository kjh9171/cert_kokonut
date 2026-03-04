import React, { useState, useEffect } from "react";
// 보안 및 UI를 위한 아이콘 세트 (lucide-react) - 필수 라이브러리 임포트
import {
  Shield,
  Users,
  Database,
  Key,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Download,
  Plus,
  LayoutDashboard,
  History,
  Mail,
  CreditCard,
  HelpCircle,
  Eye,
  ShieldCheck,
  ChevronRight,
  Lock,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  LogIn,
  ArrowLeft,
  Globe,
  Zap,
  Check,
  Activity,
  BarChart3,
  TrendingUp,
  Save,
} from "lucide-react";
// 데이터 시각화를 위한 차트 라이브러리 (recharts) - 통계 화면용
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// --- 상수 데이터 및 메뉴 구성 정의 ---

// 기업 관리자용 메뉴 구성 (아이콘 포함)
const COMPANY_MENU = [
  { id: "dashboard", label: "운영 대시보드", icon: LayoutDashboard },
  { id: "member_db", label: "회원 DB 관리", icon: Database },
  { id: "api_keys", label: "API 연동관리", icon: Key },
  { id: "policy", label: "개인정보처리방침", icon: ShieldCheck },
  { id: "subscription", label: "구독 관리", icon: CreditCard },
];

// 시스템 관리자(공급자) 전용 메뉴 구성
const SYSTEM_MENU = [
  { id: "total_stats", label: "전체 통계", icon: BarChart3 },
  { id: "company_manage", label: "고객사 관리", icon: Globe },
  { id: "security_monitor", label: "보안 모니터링", icon: Activity },
  { id: "billing_stats", label: "매출 현황", icon: TrendingUp },
  { id: "system_settings", label: "시스템 설정", icon: Settings },
];

// 차트 시각화를 위한 샘플 데이터 셋
const CHART_DATA = [
  { name: "02.26", value: 400, api: 2400 },
  { name: "02.27", value: 300, api: 1398 },
  { name: "02.28", value: 600, api: 9800 },
  { name: "03.01", value: 800, api: 3908 },
  { name: "03.02", value: 500, api: 4800 },
];

// 메인 애플리케이션 컴포넌트
export default function App() {
  // --- 상태 관리 (State Management) ---

  // 현재 접속한 사용자 세션 정보 (로컬 스토리지에서 복구)
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("cert_pms_user")) || null,
  );
  // 현재 활성화된 화면 상태: 'landing' | 'login' | 'signup' | 'company_admin' | 'system_admin'
  const [currentScreen, setCurrentScreen] = useState(() =>
    user ? "company_admin" : "landing",
  );
  // 대시보드 내에서 선택된 활성 탭
  const [activeTab, setActiveTab] = useState("dashboard");
  // 사이드바의 확장/축소 상태 (UI UX 최적화)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- 비즈니스 로직 연동용 상태 ---

  // 회사 기본 정보 (영속성 유지)
  const [companyInfo, setCompanyInfo] = useState(
    () =>
      JSON.parse(localStorage.getItem("pms_company_persistence")) || {
        name: "CERT PMS HUB",
        bizNum: "101-88-12345",
        manager: "안티그래비티 총괄",
        email: "cert@pms.com",
      },
  );
  // 상계 가능 크레딧 및 통계 정보
  const [credits, setCredits] = useState(
    () => Number(localStorage.getItem("pms_credit_balance")) || 100000,
  );
  const [stats, setStats] = useState({ total: 1284, today: 42, alerts: 0 });

  // --- 보조 기능 함수 ---

  // 로그아웃 처리 (로컬 스토리지 파기 및 초기화)
  const handleLogout = () => {
    if (!window.confirm("시스템 세션을 즉시 파기하고 로그아웃하시겠습니까?"))
      return;
    localStorage.removeItem("cert_pms_user");
    setUser(null);
    setCurrentScreen("landing");
  };

  // 로그인 성고 시 처리 로직 (모의 인증 체계)
  const handleAuthSuccess = (userData) => {
    localStorage.setItem("cert_pms_user", JSON.stringify(userData));
    setUser(userData);
    setCurrentScreen("company_admin");
  };

  // 회사 정보 영구 저장 처리 (로컬 스토리지 동기화)
  const handleCompanySave = (updatedInfo) => {
    setCompanyInfo(updatedInfo);
    localStorage.setItem(
      "pms_company_persistence",
      JSON.stringify(updatedInfo),
    );
    alert("회사 보안 정보가 영구 저장소에 동기화되었습니다! 충성!");
  };

  // --- View 컴포넌트 정의 ---

  // 1. 서비스 메인 홈페이지 (Landing View)
  const HomeView = () => (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 animate-in fade-in duration-700">
      {/* 고정 상단 네비게이션 (유리 효과 적용) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentScreen("landing")}
          >
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <Shield size={24} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 uppercase">
              PMS Center
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">
              주요기능
            </a>
            <a href="#security" className="hover:text-blue-600 transition">
              보안기술
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition">
              요금제
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentScreen("login")}
              className="text-sm font-bold text-slate-800 px-4 py-2 hover:bg-slate-50 rounded-xl transition"
            >
              로그인
            </button>
            <button
              onClick={() => setCurrentScreen("signup")}
              className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200"
            >
              무료 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 환영 섹션 */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <Zap size={14} fill="currentColor" /> Trust & Security First
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
            개인정보 보호,
            <br />
            이제 <span className="text-blue-600">자동화</span>의 시대입니다.
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            복잡한 컴플라이언스 대응부터 데이터 암호화 보관까지,
            <br />
            기업의 보안 리스크를 단 하나의 플랫폼으로 해결하세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setCurrentScreen("signup")}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200"
            >
              지금 가입하고 무료 체험
            </button>
            <button className="px-10 py-5 bg-white text-slate-800 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition">
              서비스 소개서 받기
            </button>
          </div>
        </div>
      </section>

      {/* 핵심 특징 나열 섹션 */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "강력한 암호화",
              desc: "AES-256 대칭키 암호화 및 AWS KMS 기반의 키 관리를 지원합니다.",
              icon: Lock,
            },
            {
              title: "컴플라이언스 대응",
              desc: "ISMS-P 인증에 필요한 각종 증적 자료와 처리방침을 자동 생성합니다.",
              icon: ShieldCheck,
            },
            {
              title: "개발 편의성",
              desc: "REST API를 통해 단 몇 줄의 코드로 기존 시스템과 연동이 가능합니다.",
              icon: Key,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <f.icon size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                {f.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 푸터 영역 */}
      <footer className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield size={28} className="text-blue-500" />
              <span className="font-black text-2xl tracking-tighter">
                PMS Center
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
              국내 최고 수준의 보안 전문가들이 만드는
              <br />
              개인정보 통합 관리 솔루션입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h4 className="font-black mb-6 uppercase text-xs tracking-widest text-blue-500">
                Service
              </h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li className="hover:text-white cursor-pointer transition">
                  주요기능
                </li>
                <li className="hover:text-white cursor-pointer transition">
                  보안철학
                </li>
                <li className="hover:text-white cursor-pointer transition">
                  업데이트 내역
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-6 uppercase text-xs tracking-widest text-blue-500">
                Legal
              </h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li className="hover:text-white cursor-pointer transition">
                  이용약관
                </li>
                <li className="hover:text-white cursor-pointer transition text-blue-400">
                  개인정보처리방침
                </li>
                <li className="hover:text-white cursor-pointer transition">
                  쿠키정책
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-800 text-center text-slate-600 text-xs font-black tracking-widest uppercase">
          © 2026 PMS Center Inc. All Rights Reserved.
        </div>
      </footer>
    </div>
  );

  // 2. 기업 관리자 메인 뷰 (Company Admin Dashboard)
  const CompanyAdminView = () => {
    // 내부 폼 입력을 위한 임시 상태
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [tempInfo, setTempInfo] = useState({ ...companyInfo });

    // 수정 완료 저장 이벤트
    const handleSaveInfo = () => {
      handleCompanySave(tempInfo);
      setIsEditingInfo(false);
    };

    return (
      <div className="min-h-screen bg-[#f8fafc] flex animate-in fade-in duration-700">
        {/* 사이드바 - 왼쪽 고정 레이아웃 */}
        <aside
          className={`bg-slate-900 text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}
        >
          <div
            className="h-20 flex items-center px-6 border-b border-slate-800 cursor-pointer overflow-hidden"
            onClick={() => setCurrentScreen("landing")}
          >
            <Shield className="text-blue-500 shrink-0" size={28} />
            {sidebarOpen && (
              <span className="ml-3 font-black text-xl tracking-tighter whitespace-nowrap">
                PMS Center
              </span>
            )}
          </div>
          <nav className="flex-1 py-8 px-3 space-y-1 overflow-x-hidden">
            {COMPANY_MENU.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === m.id ? "bg-blue-600 shadow-xl shadow-blue-900/40" : "text-slate-500 hover:bg-slate-800 hover:text-white"}`}
              >
                <m.icon size={20} className="shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-bold whitespace-nowrap">
                    {m.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 text-slate-500 hover:text-white transition-all w-full"
            >
              <LogIn size={20} className="shrink-0" />
              {sidebarOpen && (
                <span className="text-xs font-black whitespace-nowrap">
                  로그아웃
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* 본문 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* 상단 통합 헤더 */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex justify-between items-center sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all shadow-sm border border-slate-50"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800">
                  {user?.name || "기업 관리자"}님
                </p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                  Enterprise Master
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                <Users size={18} className="text-slate-500" />
              </div>
            </div>
          </header>

          <main className="p-10 max-w-7xl mx-auto w-full">
            {/* 페이지 제목 및 데모용 스위치 */}
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                  Control Room
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                  자사 개인정보 수집 및 보안 상태를 실시간 통제합니다.
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen("system_admin")}
                className="text-xs font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-200 transition shadow-sm border border-slate-50"
              >
                시스템 관리자(데모)
              </button>
            </div>

            {/* 탭별 조건부 렌더링 - 운영 대시보드 */}
            {activeTab === "dashboard" && (
              <div className="animate-in slide-in-from-bottom-5 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    {
                      l: "전체 보유 데이터",
                      v: stats.total.toLocaleString(),
                      c: "text-blue-600",
                    },
                    {
                      l: "금일 보안 로그",
                      v: stats.today.toLocaleString(),
                      c: "text-emerald-600",
                    },
                    { l: "암호화 등급", v: "AAA+", c: "text-indigo-600" },
                    { l: "구독 잔여 기간", v: "184일", c: "text-amber-600" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {s.l}
                      </p>
                      <p className={`text-3xl font-black ${s.c} italic`}>
                        {s.v}
                      </p>
                    </div>
                  ))}
                </div>
                {/* 시각화 차트 추가 (운영용) */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition hover:shadow-md mb-10">
                  <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> 주간 트래픽
                    양상
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient
                            id="colorVal"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#2563eb"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2563eb"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={11}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          fillOpacity={1}
                          fill="url(#colorVal)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* 회사 세부 정보 관리 화면 (영속성 연동) */}
            {activeTab === "member_db" && (
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase">
                    Security Identity
                  </h3>
                  {!isEditingInfo ? (
                    <button
                      onClick={() => setIsEditingInfo(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                      정보 개정
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveInfo}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                    >
                      <Save size={16} /> 변경상항 저장
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                        소속 기업 명칭
                      </label>
                      <input
                        disabled={!isEditingInfo}
                        value={isEditingInfo ? tempInfo.name : companyInfo.name}
                        onChange={(e) =>
                          setTempInfo({ ...tempInfo, name: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                        사업자 번호
                      </label>
                      <input
                        disabled={!isEditingInfo}
                        value={
                          isEditingInfo ? tempInfo.bizNum : companyInfo.bizNum
                        }
                        onChange={(e) =>
                          setTempInfo({ ...tempInfo, bizNum: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                        총괄 책임자
                      </label>
                      <input
                        disabled={!isEditingInfo}
                        value={
                          isEditingInfo ? tempInfo.manager : companyInfo.manager
                        }
                        onChange={(e) =>
                          setTempInfo({ ...tempInfo, manager: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                        담당자 이메일
                      </label>
                      <input
                        disabled={!isEditingInfo}
                        value={
                          isEditingInfo ? tempInfo.email : companyInfo.email
                        }
                        onChange={(e) =>
                          setTempInfo({ ...tempInfo, email: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 기타 준비 기능에 대한 홀더 화면 */}
            {activeTab !== "dashboard" && activeTab !== "member_db" && (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center animate-in fade-in duration-500">
                <Settings className="mx-auto text-slate-200 mb-6" size={64} />
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  {activeTab} 페이지 고도화 중
                </h3>
                <p className="text-slate-400 font-medium">
                  대표님의 지시에 따라 엔진 정밀 튜닝 중입니다. 충성!
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  // 3. 시스템 관리자 전용 뷰 (System Internal Control)
  const SystemAdminView = () => (
    <div className="min-h-screen bg-slate-950 flex animate-in fade-in duration-700 overflow-hidden">
      {/* 다크 테마 사이드바 */}
      <aside
        className={`bg-black text-white flex flex-col transition-all duration-500 shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="h-24 flex items-center px-8 border-b border-white/5 overflow-hidden">
          <Activity className="text-emerald-500 shrink-0" size={28} />
          {sidebarOpen && (
            <span className="ml-3 font-black text-xl tracking-tighter text-white whitespace-nowrap">
              SYSTEM OPS
            </span>
          )}
        </div>
        <nav className="flex-1 py-10 px-4 space-y-1 overflow-x-hidden">
          {SYSTEM_MENU.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === m.id ? "bg-emerald-600 shadow-xl shadow-emerald-900/20" : "text-slate-600 hover:text-white"}`}
            >
              <m.icon size={20} className="shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-bold whitespace-nowrap">
                  {m.label}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => setCurrentScreen("landing")}
            className="flex items-center gap-3 p-3 text-slate-600 hover:text-white transition-all w-full"
          >
            <Globe size={20} className="shrink-0" />
            {sidebarOpen && (
              <span className="text-xs font-black whitespace-nowrap">
                홈페이지로 이동
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* 다크 테마 메인 컨트롤 영역 */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] overflow-y-auto">
        <header className="h-24 border-b border-white/5 px-10 flex justify-between items-center sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 text-white/40 text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            Global Node: Seoul Central
          </div>
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white/5 text-white/40 rounded-2xl hover:text-white transition cursor-pointer">
              <Bell size={20} />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white">
                  CERT 총괄 관리자
                </p>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                  Super User
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/5 shadow-lg">
                <Shield size={24} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-12">
          {/* 주요 지표 대시보드 */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Control Center
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                전체 고객사 현황 및 시스템 자원을 실시간으로 감시합니다.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 shadow-sm">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                  Total MRR
                </p>
                <p className="text-xl font-black text-white italic">
                  ₩1,429,000,000
                </p>
              </div>
              <div className="bg-emerald-500/10 px-6 py-4 rounded-3xl border border-emerald-500/20 shadow-sm">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">
                  Active Users
                </p>
                <p className="text-xl font-black text-emerald-400 italic">
                  24,582
                </p>
              </div>
            </div>
          </div>

          {/* 통합 그래프 및 리소스 현황 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-white/5 p-8 rounded-[3rem] border border-white/5 shadow-sm">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> 시스템
                트래픽 분석 (전체 고객사)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "none",
                        borderRadius: "16px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="api"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorSys)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* 서버 헬스 체크 리스트 */}
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 shadow-sm">
              <h3 className="text-lg font-black text-white mb-8 uppercase italic tracking-tight">
                System Health
              </h3>
              <div className="space-y-6">
                {[
                  { n: "API 서버 (N.Seoul)", v: 98, c: "text-emerald-500" },
                  { n: "DB 클러스터", v: 42, c: "text-amber-500" },
                  { n: "암호화 HSM 모듈", v: 12, c: "text-emerald-500" },
                  { n: "CDN 엣지 노드", v: 84, c: "text-blue-500" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-500 font-black">{s.n}</span>
                      <span className={`${s.c} italic`}>{s.v}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-current ${s.c} transition-all duration-1000`}
                        style={{ width: `${s.v}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">
                  Security Status
                </p>
                <div className="flex items-center gap-2 text-emerald-500 font-black text-sm uppercase italic">
                  <CheckCircle size={16} /> All Systems Secured
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  // 4. 인증 관문 화면 (Login / Signup View)
  const AuthView = ({ type }) => {
    // 폼 관리를 위한 내부 상태
    const [authData, setAuthData] = useState({
      email: "",
      password: "",
      name: "",
    });

    // 모의 로그인 처리 (대표님 지시: 비번 1234 허용)
    const handleLoginAction = () => {
      if (
        authData.password === "1234" ||
        (authData.email && authData.password)
      ) {
        const mockUser = {
          email: authData.email || "cert@pms.com",
          name: authData.name || authData.email?.split("@")[0] || "대표 관리자",
          role: authData.email?.startsWith("admin") ? "admin" : "user",
        };
        handleAuthSuccess(mockUser);
      } else {
        alert("보안 암호를 확인해주세요. (데모 암호: 1234)");
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div
          onClick={() => setCurrentScreen("landing")}
          className="mb-10 flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 shadow-lg shadow-blue-100 transition">
            <Shield size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-800 uppercase">
            PMS Center
          </span>
        </div>

        <div className="w-full max-w-[440px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] p-12 border border-slate-100 animate-in zoom-in-95 duration-500">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 italic uppercase">
            {type === "login" ? "Welcome Back" : "Get Started"}
          </h2>
          <p className="text-slate-400 font-medium text-sm mb-10">
            {type === "login"
              ? "계정 정보를 입력하고 관제 센터에 접속하세요."
              : "기업 정보를 입력하고 보안 서비스를 즉시 시작하세요."}
          </p>

          <div className="space-y-5">
            {type === "signup" && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Company / User Name
                </label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={authData.name}
                  onChange={(e) =>
                    setAuthData({ ...authData, name: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@pms.com"
                value={authData.email}
                onChange={(e) =>
                  setAuthData({ ...authData, email: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Password (Demo: 1234)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={authData.password}
                onChange={(e) =>
                  setAuthData({ ...authData, password: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
              />
            </div>

            <button
              onClick={handleLoginAction}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 uppercase italic tracking-tighter"
            >
              {type === "login" ? "승인 및 접속" : "신규 요원 가입"}{" "}
              <ArrowLeft size={18} className="rotate-180" />
            </button>
          </div>

          <div className="mt-10 text-center text-sm font-bold text-slate-300">
            {type === "login" ? (
              <>
                아직 계정이 없으신가요?{" "}
                <span
                  onClick={() => setCurrentScreen("signup")}
                  className="text-blue-600 cursor-pointer ml-1 hover:underline"
                >
                  회원가입
                </span>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{" "}
                <span
                  onClick={() => setCurrentScreen("login")}
                  className="text-blue-600 cursor-pointer ml-1 hover:underline"
                >
                  로그인
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- 조건부 메인 렌더링 스위칭 엔진 ---
  return (
    <div className="selection:bg-blue-100">
      {currentScreen === "landing" && <HomeView />}
      {currentScreen === "login" && <AuthView type="login" />}
      {currentScreen === "signup" && <AuthView type="signup" />}
      {currentScreen === "company_admin" && <CompanyAdminView />}
      {currentScreen === "system_admin" && <SystemAdminView />}

      {/* 글로벌 폰트 및 트랜지션 스타일링 최적화 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        body { font-family: 'Noto Sans KR', sans-serif; overflow-x: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
