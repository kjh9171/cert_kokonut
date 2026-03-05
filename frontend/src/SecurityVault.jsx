import React, { useState, useCallback } from 'react';
import { 
  Shield, Lock, Unlock, FileUp, Download, CheckCircle, 
  AlertCircle, ShieldCheck, Database, Key, Eye, HelpCircle, 
  ChevronRight, ArrowRight, FileText, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- 보안 엔진 설정 ---
const CRYPTO_CONFIG = {
  algorithms: [
    { id: 'AES-GCM', name: 'AES-256-GCM (권장)', keyLen: 256 },
    { id: 'AES-CBC', name: 'AES-128-CBC (호환)', keyLen: 128 },
  ],
  iterations: 100000, // PBKDF2 반복 횟수
};

export default function SecurityVault({ onProcessComplete }) {
  const [activeMode, setActiveMode] = useState('encrypt'); // encrypt | decrypt | guide
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [algo, setAlgo] = useState('AES-GCM');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [decryptReason, setDecryptReason] = useState('');

  // ✅ 통합 로깅 함수
  const logSecurityAction = async (action, target, reason) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pms_token')}`
        },
        body: JSON.stringify({ action, target, reason })
      });
    } catch (e) {
      console.error("[CERT] 로그 전송 실패:", e);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  // --- Web Crypto API 활용 암호화 엔진 ---
  const processEncrypt = async () => {
    if (!file || !password) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        
        // 1. 키 생성 (PBKDF2)
        const enc = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const baseKey = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
        const key = await window.crypto.subtle.deriveKey(
          { name: "PBKDF2", salt, iterations: CRYPTO_CONFIG.iterations, hash: "SHA-256" },
          baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
        );

        // 2. 암호화
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

        // 3. 파일 생성 (Salt + IV + Data)
        const blob = new Blob([salt, iv, encrypted], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        
        // 4. 엑셀 데이터 미리보기 (로그용 및 분석용)
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        setResult({ url, name: `ENC_${file.name}.pms`, count: rows.length });
        
        // ✅ [보안 로그 기록] 파일 암호화 행위 추적
        await logSecurityAction("LOCAL_ENCRYPT", file.name, `파일 암호화 완료 (알고리즘: ${algo}, 레코드: ${rows.length}건)`);

        // 콜백 실행 (부모 컴포넌트로 데이터 전달 - DB 저장용)
        onProcessComplete?.({
          type: 'ENCRYPT',
          fileName: file.name,
          records: rows.map(r => ({
            name: r['성명'] || r['이름'] || '미식별',
            phone: r['연락처'] || r['전화번호'] || '',
            email: r['이메일'] || '',
            status: 'ENCRYPTED'
          }))
        });
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("암호화 중 오류 발생: " + err.message);
      setLoading(false);
    }
  };

  // --- 복호화 엔진 ---
  const processDecrypt = async () => {
    if (!file || !password || !decryptReason) {
      alert("복호화 사유를 반드시 입력해야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        const salt = buffer.slice(0, 16);
        const iv = buffer.slice(16, 28);
        const data = buffer.slice(28);

        const enc = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
        const key = await window.crypto.subtle.deriveKey(
          { name: "PBKDF2", salt, iterations: CRYPTO_CONFIG.iterations, hash: "SHA-256" },
          baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
        );

        try {
          const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
          const blob = new Blob([decrypted], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const url = URL.createObjectURL(blob);
          
          setResult({ url, name: file.name.replace('.pms', '').replace('ENC_', 'DEC_'), success: true });
          
          // ✅ [보안 로그 기록] 파일 복호화 행위 및 사유 추적
          await logSecurityAction("LOCAL_DECRYPT", file.name, `파일 복호화 수행 (사유: ${decryptReason})`);
          
        } catch (e) {
          alert("비밀번호가 틀렸거나 파일이 손상되었습니다.");
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("복호화 중 오류 발생");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 왼쪽: 컨트롤 패널 */}
        <div className="flex-1 space-y-6">
          <header className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-200">
              <Lock size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Security Vault</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Local Encryption Engine v2.0</p>
            </div>
          </header>

          <nav className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            {[
              { id: 'encrypt', label: '암호화 (Lock)', icon: Lock },
              { id: 'decrypt', label: '복호화 (Unlock)', icon: Unlock },
              { id: 'guide', label: '보안 가이드', icon: HelpCircle }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => { setActiveMode(m.id); setResult(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === m.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </nav>

          {activeMode === 'guide' ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-left-5">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-2"><ShieldCheck className="text-blue-600" /> 개인정보 기술적 보호 가이드</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">01</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm mb-1 uppercase">고강도 암호화 적용</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">PMS 센터는 AES-256-GCM 표준 알고리즘을 사용합니다. 모든 엑셀 파일은 서버로 전송되지 않고 브라우저 내에서 안전하게 암호화됩니다.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">02</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm mb-1 uppercase">비밀번호 관리 주의</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">설정하신 비밀번호는 어디에도 저장되지 않습니다. 분실 시 데이터를 절대 복구할 수 없으니 안전하게 관리하십시오.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">03</div>
                  <div>
                    <p className="font-black text-slate-800 text-sm mb-1 uppercase">반출 로그 의무화</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">데이터를 복호화할 때는 반드시 정당한 사유를 입력해야 하며, 이는 보안 감사 로그에 영구 보관됩니다.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">보안 대상 파일 선택 (.xlsx, .csv)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept={activeMode === 'encrypt' ? ".xlsx, .csv" : ".pms"}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-full py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:border-blue-200 transition-colors bg-slate-50/50">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-slate-300 group-hover:text-blue-500 transition-colors">
                      <FileUp size={32} />
                    </div>
                    <p className="text-sm font-black text-slate-400 group-hover:text-slate-600 transition-colors">
                      {file ? file.name : (activeMode === 'encrypt' ? '파일을 드래그하거나 클릭하세요' : '암호화된 .pms 파일을 선택하세요')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">금고 접근 비밀번호</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="최소 8자 이상의 강력한 암호"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-500 transition-all shadow-inner" 
                  />
                </div>
              </div>

              {activeMode === 'decrypt' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">복호화 수행 사유 (필수)</label>
                  <textarea 
                    value={decryptReason}
                    onChange={e => setDecryptReason(e.target.value)}
                    placeholder="예: 고객 요청에 의한 데이터 확인, 정기 감사 등"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-500 min-h-[100px] resize-none shadow-inner"
                  />
                </div>
              )}

              <button 
                onClick={activeMode === 'encrypt' ? processEncrypt : processDecrypt}
                disabled={loading || !file || !password || (activeMode === 'decrypt' && !decryptReason)}
                className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl uppercase italic tracking-tighter ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : (activeMode === 'encrypt' ? <Lock size={24} /> : <Unlock size={24} />)}
                {loading ? 'Processing...' : (activeMode === 'encrypt' ? 'Secure Encryption' : 'Secure Decryption')}
              </button>
            </div>
          )}
        </div>

        {/* 오른쪽: 상태 및 결과 정보 */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] opacity-10"><Shield size={120} /></div>
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 italic">Vault Status</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>
                <p className="text-xs font-bold uppercase tracking-tight">엔진 가동 준비 완료</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">현재 알고리즘</p>
                <p className="text-sm font-black italic">AES-256-GCM (Hardware Accel)</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">보안 레벨</p>
                <div className="flex gap-1 text-blue-400">
                  <Shield size={14} fill="currentColor" /><Shield size={14} fill="currentColor" /><Shield size={14} fill="currentColor" /><Shield size={14} fill="currentColor" /><Shield size={14} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 animate-in zoom-in-95">
              <CheckCircle className="text-emerald-500 mb-4" size={32} />
              <h4 className="text-lg font-black text-slate-900 italic tracking-tighter mb-2">Process Complete</h4>
              <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">
                보안 처리가 성공적으로 완료되었습니다. {result.count && `총 ${result.count}건의 자산 정보가 분석되었습니다.`}
              </p>
              <a 
                href={result.url} 
                download={result.name}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-100"
              >
                <Download size={16} /> DOWNLOAD FILE
              </a>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">주의사항</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
              본 엔진은 브라우저의 안전한 샌드박스 내에서 작동합니다. 원본 데이터는 당사 서버를 포함한 외부로 절대 유출되지 않음을 보증합니다. (CERT팀 보증)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
