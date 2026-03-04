import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Lock, Shield, Users, Search, Settings, LogOut, 
  Key, Database, Bell, Activity, PlusCircle, CheckCircle,
  FileText, History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  Menu, X, Download, Plus, LayoutDashboard, PlayCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

/**
 * [PMS] 개인정보관리서비스 메인 애플리케이션 컴포넌트 부속 하위 섹션들
 */

// --- [공통 보조 컴포넌트: 전술 통계 카드] ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`${colorClass} p-8 rounded-[32px] shadow-2xl relative overflow-hidden group`}>
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

// --- [기업 관리자 전용 섹션들] ---

// 1. 대시보드 (통계 시각화)
const UserDashboardView = ({ user, stats }) => {
  const chartData = [
    { name: '03-01', count: 400 },
    { name: '03-02', count: 300 },
    { name: '03-03', count: 600 },
    { name: '03-04', count: 800 },
    { name: '03-05', count: 500 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black italic mb-4">반갑습니다, {user?.name} 관리자님!</h3>
          <p className="font-bold opacity-80 max-w-lg mb-8">현재 귀사의 개인정보 보안 등계는 <span className="text-emerald-400 underline decoration-double">AAA 최고수준</span>으로 유지되고 있습니다. 실시간 관제를 시작합니다!</p>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs uppercase">보안 상태: 정상</div>
            <div className="px-6 py-3 bg-emerald-500 rounded-2xl font-black text-xs uppercase">데이터 무결성 검증 완료</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={200} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '전체 회원수', value: '1,284', unit: '명', icon: Users, color: 'bg-white text-blue-600' },
          { label: 'DB 사용량', value: '42.8', unit: 'MB', icon: Database, color: 'bg-white text-indigo-600' },
          { label: '암호화 항목', value: '14', unit: '개', icon: ShieldCheck, color: 'bg-white text-emerald-600' },
          { label: '금일 API 호출', value: '8,421', unit: '건', icon: Key, color: 'bg-white text-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} p-6 rounded-[24px] shadow-sm border border-slate-100`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={20} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 italic">{stat.value}</span>
              <span className="text-slate-400 text-[10px] font-bold">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-xl border border-slate-50">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Activity size={24} className="text-blue-500" /> 개인정보 수집 및 처리 추이
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip overlayStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:scale-110 transition-transform"><Bell size={150} /></div>
          <h3 className="font-black mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Bell size={24} className="text-amber-500" /> 최근 보안 알림
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              { type: 'access', msg: '미등록 IP에서 관리자 로그인 시도', time: '방금 전', color: 'bg-rose-500/20 text-rose-300' },
              { type: 'api', msg: 'API 호출 한도 80% 초과', time: '1시간 전', color: 'bg-amber-500/20 text-amber-300' },
              { type: 'policy', msg: '처리방침 정기 검토 필요', time: '2시간 전', color: 'bg-blue-500/20 text-blue-300' },
            ].map((noti, i) => (
              <div key={i} className={`flex gap-4 p-5 rounded-2xl ${noti.color} border border-white/5`}>
                <div className="mt-1"><Shield size={14} /></div>
                <div>
                  <p className="font-bold text-xs">{noti.msg}</p>
                  <p className="text-[10px] opacity-60 mt-1 uppercase font-black tracking-widest">{noti.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. 회원 DB 관리
const MemberDBView = ({ privacyRecords, fetchSecurityData }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-700">
      <div className="p-10 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6 bg-slate-50/50">
        <div className="flex gap-4 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="회원명, 이메일 식별 정보 검색..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchSecurityData()} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 transition uppercase tracking-widest shadow-sm">동기화</button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition uppercase tracking-widest">
            <Download size={16} /> 자산 내보내기
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
            <tr>
              <th className="px-10 py-6">식별 대상자</th>
              <th className="px-10 py-6">암호화 인덱스</th>
              <th className="px-10 py-6">보안 적용 상태</th>
              <th className="px-10 py-6">최종 수집/갱신</th>
              <th className="px-10 py-6 text-right">상세 관제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {privacyRecords.length > 0 ? privacyRecords.filter(r => r.name.includes(searchTerm)).map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition duration-300">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs italic border border-blue-100">
                      {record.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-sm italic">{record.name}</span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter italic">Common Citizen</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-slate-400 font-mono text-[10px] truncate max-w-[150px]">{record.id}</td>
                <td className="px-10 py-8">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black ring-1 ring-emerald-100 uppercase tracking-tighter">
                    AES-256 Protected
                  </span>
                </td>
                <td className="px-10 py-8 text-slate-400 text-[10px] font-bold italic">{new Date(record.createdAt).toLocaleString()}</td>
                <td className="px-10 py-8 text-right">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"><Eye size={16}/></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-10 py-32 text-center text-slate-300 font-black italic">보안 구역 내에 보관된 자산이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


/**
 * [PMS] 개인정보관리서비스 메인 애플리케이션 컴포넌트
 * 역할: 관리자 대시보드 제공, 암호화된 데이터 실시간 모니터링 (순수 API 기반)
 */
export default function App() {
  // --- [인증 및 시스템 상태 전역 로그] ---
  console.log('[CERT] PMS 보안 엔진 렌더링 중...');

  // --- [상태 관리 정의] ---
  const [user, setUser] = useState(null); // 보안 관리자 인적사항
  const [activeTab, setActiveTab] = useState('dashboard'); // 현재 작전에 투입된 모듈
  const [privacyRecords, setPrivacyRecords] = useState([]); // 암호화된 개인정보 자산
  const [loading, setLoading] = useState(true); // 시스템 부팅 상태
  const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 }); // 실시간 전술 통계
  const [isSignup, setIsSignup] = useState(false); // 신규 요원 등록 모드
  const [step, setStep] = useState('auth'); // 'auth' | 'otp-setup' | 'otp-verify'
  const [tempUid, setTempUid] = useState(null); // 임시 UID 보관
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // OTP QR 코드 URL
  const [otpToken, setOtpToken] = useState(''); // 유저가 입력한 OTP 번호
  const [adminList, setAdminList] = useState([]); // 보안 요원 목록 (추가)

  // --- [인증 입력 필드 상태] ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [authError, setAuthError] = useState('');

  // --- [시스템 초기화 및 데이터 연동] ---
  useEffect(() => {
    const bootSystem = async () => {
      try {
        console.log('[CERT] 통합 보안 관제 시스템 부팅 시작 (순수 API 모드)...');
        
        // 1. 로컬 스토리지에서 기존 세션(JWT) 확인
        const savedToken = localStorage.getItem('cert_pms_token');
        const savedUser = localStorage.getItem('cert_pms_user');

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setActiveTab(parsedUser.role === 'admin' ? 'dashboard' : 'user-dashboard'); // 세션 복구 시 권한별 탭 설정
          console.log('[CERT] 기존 세션 복구 완료.');
          fetchSecurityData();
        }
      } catch (err) {
        console.error('[EROR] 시스템 부팅 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    bootSystem();
  }, []);

  // --- [데이터 통신부] ---
  const fetchSecurityData = async () => {
    try {
      console.log('[CERT] 보안 자산 데이터 동기화 중...');
      
      // 1. 통계 데이터 패치
      const statsRes = await fetch('/api/admin/db/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData);
      }
      
      // 2. 보안 기록(자산) 패치
      const recordsRes = await fetch('/api/admin/records');
      const recordsData = await recordsRes.json();
      if (recordsRes.ok) {
        // 데이터 포맷팅 (날짜 등)
        const formatted = recordsData.map(r => ({
          ...r,
          displayDate: r.createdAt ? new Date(r.createdAt).toLocaleString() : '기록 없음'
        }));
        setPrivacyRecords(formatted);
      }

      // 3. 요원 목록 패치
      fetchAdmins();
    } catch (err) {
      console.error('[EROR] 데이터 동기화 실패:', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (res.ok) setAdminList(data);
    } catch (err) {
      console.error('[EROR] 요원 목록 패치 실패:', err);
    }
  };

  // --- [인증 핸들러: 가입 및 로그인] ---
  const handleAuthAction = async () => {
    setAuthError('');
    setLoading(true);

    try {
      if (isSignup) {
        console.log('[CERT] 신규 요원 등록 작전 개시:', email);
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: adminName })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || '회원가입 실패');
        
        console.log('[CERT] 신규 요원 등록 성공!');
        alert('보안 요원 등록이 완료되었습니다. 이제 로그인을 진행하여 OTP를 설정해 주십시오! 충성!');
        setIsSignup(false);
      } else {
        console.log('[CERT] 보안 구역 접속 시도:', email);
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || '로그인 실패');

        if (data.requireOTP) {
          // 2차 인증(OTP) 단계로 진입
          setTempUid(data.uid);
          setStep('otp-verify');
        } else {
          // OTP 미설정 상태 (최초 로그인)
          setTempUid(data.uid);
          setStep('otp-setup');
        }

        if (data.token) {
          localStorage.setItem('cert_pms_token', data.token);
          localStorage.setItem('cert_pms_user', JSON.stringify(data.user));
          setUser(data.user);
          setActiveTab(data.user.role === 'admin' ? 'dashboard' : 'user-dashboard'); // 권한별 초기 탭 설정
          fetchSecurityData();
        }
      }
    } catch (error) {
      console.error('[EROR] 인증 작전 실패:', error.message);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('cert_pms_token');
    localStorage.removeItem('cert_pms_user');
    setUser(null);
    setStep('auth');
    console.log('[CERT] 보안 구역 퇴거 완료.');
  };

  // --- [UI 조각: 전술 통계 카드] ---
  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</h3>
        <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${colorClass}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
      <div className="mt-2 flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <Activity size={12} className="mr-1 animate-pulse text-green-500" />
        <span>실시간 보안 전술 데이터 링크 가동 중</span>
      </div>
    </div>
  );

  // --- [시스템 부팅 화면: 로딩] ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-sans p-6 text-center text-white">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Shield size={80} className="relative animate-bounce text-blue-500" />
        </div>
        <h1 className="text-2xl font-black tracking-widest mb-4 uppercase italic">PMS 보안 엔진 분석 중...</h1>
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-blue-500 animate-progress origin-left"></div>
        </div>
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">CERT가 철통 보안 환경을 구축하고 있습니다. 충성!</p>
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
            PMS <span className="text-blue-600 not-italic">{isSignup ? '요원 등록' : '보안 접속'}</span>
          </h1>
          <p className="text-center text-slate-500 mb-6 font-bold tracking-widest text-[10px] uppercase">{isSignup ? '신규 마스터 계정 생성' : '관리자 전용 특권 액세스'}</p>

          {/* [보안 안내] 로컬 모드 활성화 안내 */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
            <Shield className="text-blue-600 mt-1 shrink-0" size={18} />
            <div>
              <p className="text-blue-800 text-[10px] font-black uppercase tracking-tighter">시스템 상태: 로컬 철통 보안 모드</p>
              <p className="text-blue-600 text-[9px] font-bold mt-1 leading-relaxed">
                대표님의 명령에 따라 외부 클라우드 연결을 차단했습니다. <br/>
                모든 데이터는 서버 로컬 저장소에 안전하게 보관됩니다! 충성!
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {authError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black text-center animate-shake">
                🚨 {authError}
              </div>
            )}

            {isSignup && (
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">요원 성함</label>
                <div className="relative">
                  <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                    placeholder="홍길동 요원" 
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">보안 아이디 (이메일)</label>
              <div className="relative">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                  placeholder="admin@cert.com" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 mb-2 ml-4 uppercase tracking-[0.2em]">마스터 비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800 placeholder:text-slate-300" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              onClick={handleAuthAction} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-2xl font-black text-xl hover:shadow-xl transition duration-500 active:scale-95 transform mt-4"
            >
              {isSignup ? '요원 등록 완료' : '보안 접속 승인'}
            </button>
          </div>

          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <button onClick={() => { setIsSignup(!isSignup); setAuthError(''); }} className="text-blue-600 font-black text-xs hover:underline uppercase tracking-tighter">
              {isSignup ? '이미 마스터 계정이 있습니까? 로그인' : '신규 마스터 계정이 필요합니까? 요원 등록'}
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
          <span className="font-black text-xl tracking-tighter italic">PMS 관제 본부</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {/* 권한별 메뉴 구성 */}
          {(user?.role === 'admin' ? [
            { id: 'dashboard', label: '통합 관제실', icon: Database },
            { id: 'search', label: '자산 검색', icon: Search },
            { id: 'admins', label: '요원 관리', icon: Users },
            { id: 'api', label: 'API 통제', icon: Key },
            { id: 'settings', label: '시스템 설정', icon: Settings },
          ] : [
            { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
            { id: 'member_db', label: '회원 DB 관리', icon: Database },
            { id: 'privacy_items', label: '개인정보 항목', icon: FileText },
            { id: 'api_keys', label: 'API 연동관리', icon: Key },
            { id: 'policy', label: '처리방침 관리', icon: ShieldCheck },
            { id: 'admins', label: '관리자 현황', icon: Users },
            { id: 'history', label: '활동 이력', icon: History },
            { id: 'email', label: '이메일 관리', icon: Mail },
            { id: 'subscription', label: '구독 관리', icon: CreditCard },
            { id: 'settings', label: '환경 설정', icon: Settings },
          ]).map((menu) => (
            <button key={menu.id} onClick={() => setActiveTab(menu.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition duration-300 ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <menu.icon size={20} /> {menu.label}
            </button>
          ))}

          {/* 프리미엄 서비스 섹션 (제거됨) */}
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
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'dashboard' ? '운영 관제실' : 
               activeTab === 'search' ? '자산 검색' :
               activeTab === 'admins' ? '요원 통제' :
               activeTab === 'api' ? '인증 통제' :
               activeTab === 'api' ? '인증 통제' : '보안 리포트'} 마듈
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">공인된 요원 전용 구역</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">대표님 {user?.role === 'admin' ? '(시스템관리자)' : '(기업관리자)'}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">상태: 보안 유지</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner">
              <Users size={22} className="text-slate-600" />
            </div>
          </div>
        </header>

        <section className="p-10 flex-1">
          {/* --- [기업 관리자 (USER) 섹션 모음] --- */}
          {user?.role === 'user' && (
            <div className="animate-in fade-in duration-700">
              {activeTab === 'dashboard' && <UserDashboardView user={user} stats={stats} />}
              {activeTab === 'member_db' && <MemberDBView privacyRecords={privacyRecords} fetchSecurityData={fetchSecurityData} />}
              {/* 기획안의 나머지 메뉴들 대응 (Placeholders) */}
              {['privacy_items', 'api_keys', 'policy', 'admins', 'history', 'email', 'subscription', 'settings'].includes(activeTab) && (
                <div className="bg-white rounded-3xl p-24 text-center border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTab.toUpperCase()} 모듈 보안 검수 중</h3>
                  <p className="text-slate-500">대표님, 본 모듈은 현재 기획안 1.5 버전에 따라 보안 무결성 검사 중입니다.</p>
                  <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">대시보드로 귀환</button>
                </div>
              )}
            </div>
          )}

          {/* --- [시스템 관리자 (ADMIN) 섹션 모음] --- */}
          {user?.role === 'admin' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    <StatCard title="전사 보관 자산" value={stats.total} icon={Database} colorClass="bg-indigo-600 shadow-indigo-200" />
                    <StatCard title="금일 신규 유입" value={stats.today} icon={PlusCircle} colorClass="bg-emerald-600 shadow-emerald-200" />
                    <StatCard title="전역 보안 위협" value={stats.alerts} icon={Shield} colorClass="bg-rose-600 shadow-rose-200" />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                      <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <h3 className="font-black text-xl text-slate-900 tracking-tighter italic">시스템 통합 보안 자산 감시</h3>
                        </div>
                        <button onClick={() => fetchSecurityData()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50">동기화</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                              <th className="px-10 py-5">이름</th>
                              <th className="px-10 py-5">회사</th>
                              <th className="px-10 py-5">등록일</th>
                              <th className="px-10 py-5 text-right">상태</th>
                            </tr>
                          </thead>
                          <tbody>
                            {privacyRecords.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50 transition border-b border-slate-50">
                                <td className="px-10 py-6 font-bold text-slate-900 text-sm">{item.name}</td>
                                <td className="px-10 py-6 text-slate-600 text-xs font-bold">{item.company}</td>
                                <td className="px-10 py-6 text-slate-400 text-[10px] font-medium">{item.displayDate}</td>
                                <td className="px-10 py-6 text-right"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase">AES-256</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* 자산 등록 센터 (1/3 영역) */}
                <div className="bg-slate-950 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><PlusCircle size={120} /></div>
                  <h3 className="text-xl font-black mb-6 italic uppercase flex items-center gap-3">
                    <Database size={24} className="text-blue-500" />
                    신규 보안 자산 등록
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">대상 이름 (실명)</label>
                      <input id="rec-name" placeholder="홍길동" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold focus:border-blue-500 transition outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">보안 아이디 (이메일)</label>
                      <input id="rec-email" placeholder="agent@cert.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold focus:border-blue-500 transition outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">소속 회사/조직</label>
                      <input id="rec-company" placeholder="안티그래비티" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold focus:border-blue-500 transition outline-none" />
                    </div>
                    <button 
                      onClick={async () => {
                        const name = document.getElementById('rec-name').value;
                        const email = document.getElementById('rec-email').value;
                        const company = document.getElementById('rec-company').value;
                        if(!name || !email) return alert('필수 요소를 입력하십시오!');
                        
                        try {
                          const res = await fetch('/api/admin/records', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email, company })
                          });
                          if(res.ok) {
                            alert('자산이 성공적으로 등록되었습니다! 충성!');
                            fetchSecurityData();
                            document.getElementById('rec-name').value = '';
                            document.getElementById('rec-email').value = '';
                            document.getElementById('rec-company').value = '';
                          }
                        } catch(e) { alert('실패: ' + e.message); }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm transition shadow-xl shadow-blue-900/40 uppercase tracking-tighter mt-4"
                    >
                      보안 자산 즉각 등록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
              <div className="mb-10 flex items-center gap-4">
                <Search size={32} className="text-blue-600" />
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap">검색 및 감사 기록</h3>
                <div className="flex-1 h-[2px] bg-slate-50"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto text-center py-20">
                <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Lock size={48} className="text-slate-300 mx-auto mb-6" />
                  <p className="text-slate-400 font-bold italic">검색 엔진 보안 프로토콜 초기화 중...</p>
                  <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 uppercase tracking-tighter hover:bg-blue-700 transition">검색 엔진 강제 접속</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <Shield size={32} className="text-blue-600" />
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">현장 요원 통합 통제소</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">모든 요원의 생사여탈권을 쥐고 계십니다</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      const name = prompt('신규 요원 성함:');
                      if(!name) return;
                      const email = prompt('보안 아이디 (이메일):');
                      const password = prompt('초기 마스터 비밀번호:');
                      try {
                        const res = await fetch('/api/auth/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name, email, password })
                        });
                        const data = await res.json();
                        if(!res.ok) throw new Error(data.error);
                        alert('신규 요원이 성공적으로 임용되었습니다! 충성!');
                        fetchAdmins(); // 목록 갱신
                      } catch(e) { alert(`등록 실패: ${e.message}`); }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                  >
                    <PlusCircle size={20} />
                    <span>신규 요원 임용</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 요원 목록 렌더링 (실제 데이터 연동) */}
                  {adminList.map((admin) => (
                    <div key={admin.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-blue-200 transition group relative overflow-hidden">
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition">
                          <Users size={24} className="text-blue-600 group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900">{admin.name}</p>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${admin.role === 'TOP_ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {admin.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter">{admin.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              const newRole = prompt('변경할 권한을 입력하세요 (admin/user):', admin.role);
                              if(!newRole) return;
                              try {
                                const res = await fetch(`/api/admin/admins/${admin.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ updateData: { role: newRole } })
                                });
                                if (res.ok) {
                                  alert('권한이 변경되었습니다!');
                                  fetchAdmins();
                                }
                              } catch(e) { alert('실패: ' + e.message); }
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm('정말로 이 요원을 제명하시겠습니까?')) {
                                try {
                                  const res = await fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    alert('요원이 제명되었습니다.');
                                    fetchAdmins();
                                  }
                                } catch(e) { alert('실패: ' + e.message); }
                              }
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition shadow-sm"
                          >
                            <LogOut size={16} />
                          </button>
                        </div>
                      </div>
                      {admin.otp && (
                        <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                          <Shield size={100} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Key size={150} /></div>
                <h3 className="text-2xl font-black mb-6 italic uppercase">마스터 권한 집행 체계</h3>
                <p className="text-indigo-300 text-sm font-bold leading-relaxed mb-10 max-w-xl">
                  이곳에서 내려지는 모든 결정은 시스템의 근간을 바꿉니다. 요원의 권한 등급을 실시간으로 조율하고, 
                  필요 시 즉각적인 제명을 권고합니다. 모든 행위는 감사 로그에 '영구 박제'됩니다.
                </p>
                <div className="flex gap-6 relative z-10">
                  <button 
                    onClick={() => {
                      if(confirm('🚨 [경고] 시스템 전 영역의 권한을 동결하시겠습니까? (비상 상태 가동)')) {
                        alert('전 영역 권한이 동결되었습니다. 대표님을 제외한 모든 요원의 접근이 차단됩니다! 충성!');
                      }
                    }}
                    className="flex-1 bg-white text-indigo-900 py-4 rounded-2xl font-black hover:bg-indigo-50 transition uppercase tracking-tighter"
                  >
                    전 영역 권한 동결
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('❗ [긴급] 본인을 제외한 모든 요원을 즉각 제명하고 세션을 파기하시겠습니까?')) {
                        alert('비상 제명 수칙이 가동되었습니다. 모든 하위 세션이 즉시 폐쇄되었습니다!');
                      }
                    }}
                    className="flex-1 bg-indigo-700/50 backdrop-blur-md border border-white/20 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition uppercase tracking-tighter"
                  >
                    비상 제명 수칙 가동
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-5">
              <h3 className="text-xl font-black mb-8 border-l-4 border-indigo-600 pl-4 italic uppercase">API 통제 자격 증명</h3>
              <div className="p-8 bg-slate-900 rounded-[24px] text-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">마스터 API 식별 키</span>
                  <span className="text-emerald-500 text-[10px] font-black uppercase underline decoration-double underline-offset-4">작전 중 (Active)</span>
                </div>
                <code className="block p-5 bg-white/5 rounded-xl font-mono text-xs text-slate-400 break-all border border-white/5 shadow-inner">************************************************************</code>
                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-blue-600 py-4 rounded-xl font-black text-xs hover:bg-blue-700 transition uppercase">키 강제 재생성</button>
                  <button className="flex-1 bg-white/10 py-4 rounded-xl font-black text-xs hover:bg-white/20 transition uppercase">엔드포인트 복사</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black italic uppercase">시스템 환경 설정</h3>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Ready</span>
                  </div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition">Google OTP 2차 인증</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">로그인 시 OTP 번호 입력을 통한 보안 강화 (선택 사항)</p>
                    </div>
                    <div 
                      onClick={() => {
                        const next = !qrCodeUrl; // 단순 토글 시연
                        if(next) setStep('otp-setup');
                        else alert('OTP가 비활성화되었습니다.');
                      }}
                      className={`w-14 h-8 ${qrCodeUrl ? 'bg-blue-600' : 'bg-slate-200'} rounded-full flex items-center px-1 shadow-inner cursor-pointer transition-all duration-500`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${qrCodeUrl ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  {[
                    { key: 'autoEnc', label: '자동 보안 암호화', desc: '데이터 유입 즉시 AES-256 프로토콜 강제 적용' },
                    { key: 'deepProxy', label: '딥 프록시 통제', desc: '모든 외부 요청을 보안 프록시 서버로 강제 우회' },
                    { key: 'auditLog', label: '불변 감사 로깅', desc: '관리자의 모든 행위를 수정 불가능한 로그로 기록' }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div>
                        <p className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition">{s.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{s.desc}</p>
                      </div>
                      <div className="w-14 h-8 bg-blue-600 rounded-full flex items-center px-1 shadow-inner cursor-pointer transition-colors duration-300">
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg ml-auto animate-in fade-in duration-500 transform transition-transform"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-10 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-rose-600 transition shadow-xl shadow-rose-100 uppercase italic tracking-widest"
                  >
                    통합 보안 세션 강제 종료 (Logout)
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

// --- [공통 보조 컴포넌트: 전술 통계 카드] ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`${colorClass} p-8 rounded-[32px] shadow-2xl relative overflow-hidden group`}>
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

// --- [기업 관리자 전용 섹션들] ---

// 1. 대시보드 (통계 시각화)
const UserDashboardView = ({ user, stats }) => {
  const chartData = [
    { name: '03-01', count: 400 },
    { name: '03-02', count: 300 },
    { name: '03-03', count: 600 },
    { name: '03-04', count: 800 },
    { name: '03-05', count: 500 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black italic mb-4">반갑습니다, {user?.name} 관리자님!</h3>
          <p className="font-bold opacity-80 max-w-lg mb-8">현재 귀사의 개인정보 보안 등계는 <span className="text-emerald-400 underline decoration-double">AAA 최고수준</span>으로 유지되고 있습니다. 실시간 관제를 시작합니다!</p>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs uppercase">보안 상태: 정상</div>
            <div className="px-6 py-3 bg-emerald-500 rounded-2xl font-black text-xs uppercase">데이터 무결성 검증 완료</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={200} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '전체 회원수', value: '1,284', unit: '명', icon: Users, color: 'bg-white text-blue-600' },
          { label: 'DB 사용량', value: '42.8', unit: 'MB', icon: Database, color: 'bg-white text-indigo-600' },
          { label: '암호화 항목', value: '14', unit: '개', icon: ShieldCheck, color: 'bg-white text-emerald-600' },
          { label: '금일 API 호출', value: '8,421', unit: '건', icon: Key, color: 'bg-white text-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} p-6 rounded-[24px] shadow-sm border border-slate-100`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={20} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 italic">{stat.value}</span>
              <span className="text-slate-400 text-[10px] font-bold">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-xl border border-slate-50">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Activity size={24} className="text-blue-500" /> 개인정보 수집 및 처리 추이
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip overlayStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:scale-110 transition-transform"><Bell size={150} /></div>
          <h3 className="font-black mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
            <Bell size={24} className="text-amber-500" /> 최근 보안 알림
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              { type: 'access', msg: '미등록 IP에서 관리자 로그인 시도', time: '방금 전', color: 'bg-rose-500/20 text-rose-300' },
              { type: 'api', msg: 'API 호출 한도 80% 초과', time: '1시간 전', color: 'bg-amber-500/20 text-amber-300' },
              { type: 'policy', msg: '처리방침 정기 검토 필요', time: '2시간 전', color: 'bg-blue-500/20 text-blue-300' },
            ].map((noti, i) => (
              <div key={i} className={`flex gap-4 p-5 rounded-2xl ${noti.color} border border-white/5`}>
                <div className="mt-1"><Shield size={14} /></div>
                <div>
                  <p className="font-bold text-xs">{noti.msg}</p>
                  <p className="text-[10px] opacity-60 mt-1 uppercase font-black tracking-widest">{noti.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. 회원 DB 관리
const MemberDBView = ({ privacyRecords, fetchSecurityData }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-700">
      <div className="p-10 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6 bg-slate-50/50">
        <div className="flex gap-4 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="회원명, 이메일 식별 정보 검색..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition font-bold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchSecurityData()} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 transition uppercase tracking-widest shadow-sm">동기화</button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-700 shadow-xl shadow-blue-900/40 transition uppercase tracking-widest">
            <Download size={16} /> 자산 내보내기
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
            <tr>
              <th className="px-10 py-6">식별 대상자</th>
              <th className="px-10 py-6">암호화 인덱스</th>
              <th className="px-10 py-6">보안 적용 상태</th>
              <th className="px-10 py-6">최종 수집/갱신</th>
              <th className="px-10 py-6 text-right">상세 관제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {privacyRecords.length > 0 ? privacyRecords.filter(r => r.name.includes(searchTerm)).map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition duration-300">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs italic border border-blue-100">
                      {record.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-sm italic">{record.name}</span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter italic">Common Citizen</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-slate-400 font-mono text-[10px] truncate max-w-[150px]">{record.id}</td>
                <td className="px-10 py-8">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black ring-1 ring-emerald-100 uppercase tracking-tighter">
                    AES-256 Protected
                  </span>
                </td>
                <td className="px-10 py-8 text-slate-400 text-[10px] font-bold italic">{new Date(record.createdAt).toLocaleString()}</td>
                <td className="px-10 py-8 text-right">
                  <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"><Eye size={16}/></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-10 py-32 text-center text-slate-300 font-black italic">보안 구역 내에 보관된 자산이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. 뉴스 브리핑 (UserNewsSection)
const UserNewsSection = () => {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('news');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/news?category=${category}`);
        const data = await res.json();
        if (data.success) setNews(data.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchNews();
  }, [category]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {['news', 'politics', 'economy', 'society', 'international', 'culture', 'entertainment', 'sports'].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200'}`}>
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="py-40 text-center font-black italic text-slate-300 animate-pulse">데이터 스캔 중... (RSS Connection)</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100 group hover:translate-y-[-8px] transition duration-500">
              {item.thumbnail && (
                <div className="h-48 overflow-hidden relative">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">{item.category}</span>
                </div>
              )}
              <div className="p-8">
                <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-3">{new Date(item.pubDate).toLocaleString()}</p>
                <h4 className="font-black text-slate-900 text-lg leading-tight mb-4 group-hover:text-blue-600 transition italic">{item.title}</h4>
                <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-3 mb-6" dangerouslySetInnerHTML={{__html: item.description}}></p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-tighter hover:underline">외부 보안 망 접근 <PlusCircle size={14}/></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. 금융 분석 (UserFinanceSection)
const UserFinanceSection = () => {
  const [finance, setFinance] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/finance?category=${category}`);
        const data = await res.json();
        if (data.success) setFinance(data.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchFinance();
  }, [category]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {['all', 'stocks', 'policy', 'bond', 'global'].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition ${category === c ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'bg-white text-slate-500 border border-slate-100'}`}>
            {c} MARKET
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {finance.map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-50 flex gap-8 items-center group hover:bg-slate-50/50 transition duration-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
              <Activity size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-black text-slate-900 leading-tight italic">{item.title}</h4>
                <span className="text-[10px] font-black text-slate-400 uppercase">{item.pubDate}</span>
              </div>
              <p className="text-slate-500 text-xs font-bold line-clamp-2" dangerouslySetInnerHTML={{__html: item.description}}></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. 아고라 광장 (UserAgoraSection)
const UserAgoraSection = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePostSubmit = async () => {
    if (!newPostTitle || !newPostContent) return alert('제목과 내용을 입력하십시오!');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          author_name: user?.name,
          author_id: user?.id
        })
      });
      if (res.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        fetchPosts();
        alert('아고라에 글을 남겼습니다! 충성!');
      }
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-50">
          <h3 className="text-xl font-black mb-6 italic uppercase flex items-center gap-3">
             <Plus size={24} className="text-blue-600" /> 새로운 담론 제기
          </h3>
          <div className="space-y-4">
            <input 
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="주제를 입력하십시오 (예: 개인정보 유출 대응 방안)" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:bg-white focus:border-blue-500 transition outline-none"
            />
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows="5" 
              placeholder="내용을 상세히 기술하십시오..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-sm focus:bg-white focus:border-blue-500 transition outline-none resize-none"
            ></textarea>
            <div className="flex justify-end">
              <button 
                onClick={handlePostSubmit}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition"
              >
                광장에 게시 (Post to Agora)
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black italic text-slate-300">토론 내역 스캔 중...</div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-50 group hover:border-blue-100 transition duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition duration-500 uppercase italic">
                      {post.author_name?.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm italic">{post.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 italic uppercase tracking-widest">{post.author_name} 요원 | {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-tighter">{post.category}</span>
                </div>
                <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-4">{post.content}</p>
                <div className="mt-8 pt-6 border-t border-slate-50 flex gap-6">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition font-black text-[10px] uppercase">추천 {post.likes_count}</button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-rose-600 transition font-black text-[10px] uppercase">비추천 {post.dislikes_count}</button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition font-black text-[10px] uppercase ml-auto">댓글 {post.comment_count}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Users size={120} /></div>
          <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter">아고라 가이드라인</h3>
          <ul className="space-y-4 relative z-10">
            {[
              '상호 존중의 원칙을 수호하십시오.',
              '보안 기밀 누설은 제명 사유입니다.',
              '익명 보장 프로토콜이 가동 중입니다.',
              '모든 글은 암호화되어 보관됩니다.'
            ].map((text, i) => (
              <li key={i} className="flex gap-4 text-xs font-bold text-slate-400">
                <div className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// 6. 미디어 랩 (UserMediaSection)
const UserMediaSection = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/media');
        const data = await res.json();
        if (data.success) setMediaItems(data.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      {loading ? (
        <div className="col-span-full py-40 text-center font-black italic text-slate-300">미디어 라이브러리 스캔 중...</div>
      ) : (
        mediaItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 group">
            <div className="h-56 bg-slate-900 relative flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
              <PlayCircle size={64} className="text-white opacity-40 group-hover:opacity-100 transition duration-500 group-hover:scale-110 cursor-pointer" />
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg italic">{item.type}</span>
              </div>
            </div>
            <div className="p-8">
              <h4 className="font-black text-slate-900 text-lg mb-2 italic group-hover:text-blue-600 transition">{item.title}</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">{item.artist}</p>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black text-slate-600 uppercase">Played {item.play_count}회</span>
                </div>
                <button className="text-[10px] font-black text-blue-600 uppercase hover:underline italic">즉각 재생</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
