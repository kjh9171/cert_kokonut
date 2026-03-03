import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, User, LogOut, BarChart3, Database, 
  Settings, Key, Eye, EyeOff, LayoutDashboard, History,
  Server, ShieldAlert, Cpu, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// --- [더미 데이터 및 상수] ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// --- [공통 컴포넌트: 카드] ---
const Card = ({ title, children, icon: Icon }) => (
  <div className="glass rounded-premium p-6 shadow-premium">
    <div className="flex items-center gap-3 mb-4">
      {Icon && <Icon className="w-5 h-5 text-blue-500" />}
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

// --- [메인 애플리케이션 컴포넌트] ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 인증 여부
  const [role, setRole] = useState(null); // 사용자 역할 (user / admin)
  const [username, setUsername] = useState(""); // 접속자 이름
  const [stats, setStats] = useState({ totalRecords: 0, encryptionRate: 0, apiCalls: 0 }); // 통계 데이터
  const [users, setUsers] = useState([]); // 개인정보 리스트
  const [activeTab, setActiveTab] = useState('dashboard'); // 현재 활성화된 메뉴

  // 1. 로그인 로직
  const handleLogin = (e) => {
    e.preventDefault();
    const mockRole = e.target.role.value;
    setIsAuthenticated(true);
    setRole(mockRole);
    setUsername(e.target.username.value);
    // 실제 환경에서는 API 호출하여 토큰 발급 및 파싱
  };

  // 2. 로그아웃
  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  // 3. 복호화 요청 (보안 로직)
  const handleDecrypt = async (userId, field) => {
    alert(`[감사 로그 생성됨] ${userId}번 회원의 ${field} 정보를 복호화합니다.`);
    // 실제 API 연동 시: 
    // const res = await fetch('/api/users/decrypt', { method: 'POST', body: JSON.stringify({userId, field}) });
    // const data = await res.json();
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, [field]: field === 'email' ? 'real-email@cert.com' : '010-1111-2222' } : u
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
        <div className="w-full max-w-md glass rounded- premium p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">KOKONUT CERT</h1>
            <p className="text-slate-500 text-sm">개인정보 보호의 기준, 안티그래비티</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">아이디</label>
              <input name="username" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
              <input type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">접속 권한</label>
              <select name="role" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option value="user">기업 사용자 (Tenant)</option>
                <option value="admin">시스템 관리자 (Admin)</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold btn-hover shadow-lg">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* 사이드바 */}
      <aside className="w-64 glass border-r h-screen sticky top-0 md:flex flex-col hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <span className="font-black text-xl tracking-tight">CERT SMS</span>
        </div>
        
        <nav className="p-4 space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> 대시보드
          </button>
          
          {role === 'user' ? (
            <>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Database className="w-5 h-5" /> 회원 DB 관리
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100">
                <Key className="w-5 h-5" /> 암호화 정책
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('monitor')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'monitor' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Server className="w-5 h-5" /> 인프라 관제
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100">
                <History className="w-5 h-5" /> 감사 로그 조회
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="bg-slate-200 rounded-full p-2">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-grow">
              <p className="text-xs text-slate-400">{role === 'admin' ? 'System Admin' : 'Company User'}</p>
              <p className="text-sm font-bold truncate w-24">{username}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* 상단 헤더 */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {activeTab === 'dashboard' ? '실시간 보안 통계' : activeTab === 'users' ? '개인정보 리스트' : '시스템 상태 모니터링'}
            </h2>
            <p className="text-slate-500 text-sm">보안총괄 CERT가 시스템을 안전하게 감시하고 있습니다.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 glass rounded-lg btn-hover"><Settings className="w-5 h-5 text-slate-500" /></button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg btn-hover">인증 완료</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card title="총 개인정보" icon={Database}>
              <p className="text-3xl font-black text-blue-600">12,450 <span className="text-sm text-slate-400">건</span></p>
            </Card>
            <Card title="암호화율" icon={Lock}>
              <p className="text-3xl font-black text-emerald-500">100 <span className="text-sm text-slate-400">%</span></p>
            </Card>
            <Card title="감사 로그" icon={History}>
              <p className="text-3xl font-black text-amber-500">452 <span className="text-sm text-slate-400">건</span></p>
            </Card>
            <Card title="위협 탐지" icon={ShieldAlert}>
              <p className="text-3xl font-black text-slate-300">0 <span className="text-sm text-slate-400">건</span></p>
            </Card>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card title="데이터 증가 추이">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {name: '1월', val: 400}, {name: '2월', val: 700}, {name: '3월', val: 1200}
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="보안 적용 현황">
              <div className="h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      {name: '암호화', value: 80}, {name: '마스킹', value: 20}
                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* 회원 관리 UI (Tenant 전용) */}
        {activeTab === 'users' && (
          <div className="glass rounded-premium overflow-hidden shadow-premium">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">이름</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">이메일</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">연락처</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {id:1, name:'홍*동', email:'h***@example.com', phone:'010-****-1234'},
                  {id:2, name:'이*순', email:'s***@example.com', phone:'010-****-5678'}
                ].map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 flex items-center gap-2 group">
                      <span className="text-slate-500">{user.email}</span>
                      <button onClick={() => handleDecrypt(user.id, 'email')} className="hidden group-hover:block text-blue-500"><Eye className="w-4 h-4" /></button>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{user.phone}</td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-bold px-3 py-1 border rounded-lg hover:border-blue-500 hover:text-blue-500">수정</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 인프라 관제 UI (Admin 전용) */}
        {activeTab === 'monitor' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card title="CPU 부하" icon={Cpu}>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black text-blue-500">12%</p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4"><div className="bg-blue-500 h-2 rounded-full" style={{width:'12%'}}></div></div>
              </div>
            </Card>
            <Card title="메모리 사용" icon={Activity}>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black text-emerald-500">42%</p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4"><div className="bg-emerald-500 h-2 rounded-full" style={{width:'42%'}}></div></div>
              </div>
            </Card>
            <Card title="D1 쿼리 속도" icon={Activity}>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black text-amber-500">14ms</p>
                <p className="text-xs text-slate-400 mt-4">안정적인 상태입니다.</p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
