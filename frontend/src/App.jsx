import React, { useState, useEffect } from 'react';
// 보안 및 UI 구성을 위한 아이콘 라이브러리 (Lucide React)
import { 
  Shield, Users, Database, Key, FileText, Settings, 
  Bell, Search, Menu, X, Download, Plus, LayoutDashboard, 
  History, Mail, CreditCard, HelpCircle, Eye, ShieldCheck,
  PlusCircle, Activity, LogOut, Lock
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

// --- [기업 관리자용: 대시보드 뷰] ---
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
        <h3 className="text-3xl font-black italic mb-4">반갑습니다, {user?.name} 관리자님!</h3>
        <p className="font-bold opacity-80 max-w-lg mb-8 uppercase tracking-tighter">귀사의 보안 자산은 현재 딥 프록시 통제 하에 완벽히 보호되고 있습니다.</p>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl font-black text-xs uppercase">상태: 철통보안</div>
          <div className="px-5 py-2.5 bg-emerald-500 rounded-xl font-black text-xs uppercase">무결성 검증 완료</div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={200} /></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">보관 자산</p>
            <p className="text-2xl font-black italic">{stats.total}건</p>
          </div>
          <Database size={24} className="text-blue-600" />
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-emerald-200 transition">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">오늘 수집</p>
            <p className="text-2xl font-black italic">{stats.today}건</p>
          </div>
          <PlusCircle size={24} className="text-emerald-600" />
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-rose-200 transition">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">보안 위협</p>
            <p className="text-2xl font-black italic">{stats.alerts}건</p>
          </div>
          <Shield size={24} className="text-rose-600" />
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-amber-200 transition">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">API 평정</p>
            <p className="text-2xl font-black italic">S급</p>
          </div>
          <Key size={24} className="text-amber-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-xl border">
          <h3 className="font-black mb-8 italic uppercase flex items-center gap-3">
            <Activity size={24} className="text-blue-600" /> 수집 트래픽 모니터링
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[40px] text-white">
          <h3 className="font-black mb-8 italic uppercase flex items-center gap-3">
            <Bell size={24} className="text-amber-500" /> 실시간 보안 알림
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3 items-center">
              <Shield size={16} className="text-rose-500" />
              <p className="text-xs font-bold">비정상 접근 IP 차단됨 (192.168.x.x)</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3 items-center">
              <Activity size={16} className="text-blue-500" />
              <p className="text-xs font-bold">일일 데이터 무결성 검사 성공</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- [기업 관리자용: 회원 DB 관리 뷰] ---
const MemberDBView = ({ privacyRecords, fetchSecurityData }) => {
  const [search, setSearch] = useState('');
  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
      <div className="p-10 bg-slate-50 border-b flex justify-between items-center gap-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="자산 식별자(이름, 회사 등) 검색..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:border-blue-500 outline-none"
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchSecurityData} className="px-8 py-4 bg-white border rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition shadow-sm">동기화</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-10 py-6">요원 이름</th>
              <th className="px-10 py-6">소속</th>
              <th className="px-10 py-6">상태</th>
              <th className="px-10 py-6">암호화 일시</th>
            </tr>
          </thead>
          <tbody>
            {privacyRecords.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition border-b border-slate-50">
                <td className="px-10 py-8 font-black text-slate-900 text-sm italic">{r.name}</td>
                <td className="px-10 py-8 text-xs font-bold text-slate-500">{r.company}</td>
                <td className="px-10 py-8">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-tighter italic border border-blue-100">AES-256 Protected</span>
                </td>
                <td className="px-10 py-8 text-[10px] text-slate-400 font-bold">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- [메인 애플리케이션 컴포넌트] ---
export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cert_pms_user')) || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState('');
  const [privacyRecords, setPrivacyRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, alerts: 0 });
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    if (user) {
      fetchSecurityData();
      if (user.role === 'admin') fetchAdmins();
    }
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

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      setAdminList(data || []);
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
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cert_pms_token');
    localStorage.removeItem('cert_pms_user');
    setUser(null);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen isSignup={isSignup} setIsSignup={setIsSignup} handleAuthAction={handleAuthAction} authError={authError} />;

  const menuItems = user.role === 'admin' ? [
    { id: 'dashboard', label: '통합 관제실', icon: LayoutDashboard },
    { id: 'search', label: '자산 감시', icon: Search },
    { id: 'admins', label: '요원 통제', icon: Users },
    { id: 'api', label: 'API 컨트롤', icon: Key },
    { id: 'settings', label: '환경 설정', icon: Settings },
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
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      <aside className="w-80 bg-slate-950 text-white flex flex-col p-8 shadow-2xl relative z-20 overflow-y-auto">
        <div className="flex items-center gap-4 mb-14 px-2">
          <Shield size={28} className="text-blue-500" />
          <div>
            <h1 className="text-xl font-black italic tracking-tighter">KOKONUT PMS</h1>
            <p className="text-[8px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">Management Protocol v1.5</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black text-xs uppercase transition tracking-widest ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-8 p-4 text-slate-500 hover:text-rose-500 font-black text-xs uppercase tracking-widest flex items-center gap-4 transition">
          <LogOut size={18} /> 시스템 종료
        </button>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50">
        <header className="bg-white/80 backdrop-blur-md border-b p-8 px-10 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{activeTab} MODULE</h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 italic">대표님 [{user.role.toUpperCase()}]</p>
              <div className="flex items-center gap-1 mt-1 justify-end">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase italic">Secured</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border text-slate-400"><Users size={24} /></div>
          </div>
        </header>

        <section className="p-10">
          {user.role === 'user' && (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'dashboard' && <UserDashboardView user={user} stats={stats} />}
              {activeTab === 'member_db' && <MemberDBView privacyRecords={privacyRecords} fetchSecurityData={fetchSecurityData} />}
              {!['dashboard', 'member_db'].includes(activeTab) && (
                <div className="p-32 bg-white rounded-[48px] text-center border-4 border-dashed border-slate-50">
                  <Lock size={64} className="text-slate-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-slate-300 uppercase italic">{activeTab} 보안 검수 중</h3>
                </div>
              )}
            </div>
          )}

          {user.role === 'admin' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-700">
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="전사 보관 자산" value={stats.total} icon={Database} colorClass="bg-indigo-600" />
                    <StatCard title="금일 신규 유입" value={stats.today} icon={PlusCircle} colorClass="bg-emerald-600" />
                    <StatCard title="전역 보안 위협" value={stats.alerts} icon={Shield} colorClass="bg-rose-600" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border">
                      <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                        <h3 className="font-black italic uppercase">System Asset Monitoring</h3>
                        <button onClick={fetchSecurityData} className="text-[10px] font-black underline italic">SYNC</button>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 font-black uppercase text-[10px] tracking-widest border-b">
                            <th className="p-6">Name</th>
                            <th className="p-6">Company</th>
                            <th className="p-6 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {privacyRecords.map(r => (
                            <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                              <td className="p-6 font-black">{r.name}</td>
                              <td className="p-6 font-bold text-slate-500">{r.company}</td>
                              <td className="p-6 text-right"><span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">Protected</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-slate-950 p-10 rounded-[40px] text-white shadow-2xl">
                      <h3 className="text-2xl font-black italic mb-8 uppercase">Registration</h3>
                      <div className="space-y-4">
                        <input id="rec-name" placeholder="Name" className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 outline-none focus:border-blue-500 transition font-bold" />
                        <input id="rec-email" placeholder="Email" className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 outline-none focus:border-blue-500 transition font-bold" />
                        <input id="rec-company" placeholder="Company" className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 outline-none focus:border-blue-500 transition font-bold" />
                        <button 
                          onClick={async () => {
                            const name = document.getElementById('rec-name').value;
                            const email = document.getElementById('rec-email').value;
                            const company = document.getElementById('rec-company').value;
                            if(!name || !email) return alert('Input required!');
                            const res = await fetch('/api/admin/records', {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json'},
                              body: JSON.stringify({name, email, company})
                            });
                            if(res.ok) { fetchSecurityData(); alert('Registered!'); }
                          }}
                          className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic shadow-xl shadow-blue-900/40 hover:bg-blue-700 transition"
                        >Register Asset</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'search' && (
                <div className="bg-white p-32 rounded-[48px] text-center border-4 border-dashed italic font-black text-slate-300">
                  Search Engine Access Denied. Protocol Only.
                </div>
              )}
              {activeTab === 'admins' && (
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border">
                  <h3 className="text-3xl font-black italic mb-10 uppercase tracking-tighter">Agent Command Center</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {adminList.map(admin => (
                      <div key={admin.id} className="p-8 bg-slate-50 rounded-[32px] flex items-center gap-6 border border-slate-100 hover:border-blue-300 transition group">
                        <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center shadow-sm text-blue-600 font-black italic text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">{admin.name.slice(0,1)}</div>
                        <div>
                          <p className="font-black text-lg italic text-slate-900">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{admin.email}</p>
                          <span className="inline-block mt-3 px-3 py-1 bg-white text-[8px] font-black uppercase tracking-widest border border-slate-200 rounded-lg">{admin.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border">
                  <h3 className="text-2xl font-black italic mb-10 uppercase">System Settings</h3>
                  <div className="p-10 bg-slate-900 rounded-[32px] text-white flex justify-between items-center group">
                    <div>
                      <p className="text-xl font-black italic uppercase group-hover:text-blue-500 transition">Global Security Session</p>
                      <p className="text-xs font-bold text-slate-500 mt-2 uppercase">모든 활성 세션을 즉각 파기하고 시스템 로그아웃을 수행합니다.</p>
                    </div>
                    <button onClick={handleLogout} className="bg-rose-600 px-10 py-5 rounded-2xl font-black uppercase italic shadow-xl shadow-rose-900/40 hover:bg-rose-700 transition active:scale-95">Terminate</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
