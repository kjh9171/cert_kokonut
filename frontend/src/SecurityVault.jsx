import React, { useState, useCallback } from 'react';
import { 
  Shield, Lock, Unlock, FileUp, Download, CheckCircle, 
  AlertCircle, ShieldCheck, Database, Key, Eye, HelpCircle, 
  ChevronRight, ArrowRight, FileText, Info, RefreshCw
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [decryptReason, setDecryptReason] = useState('');

  // 통합 로깅 함수
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
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  // --- Web Crypto API 활용 암호화 엔진 (분산형 키 조합 적용) ---
  const processEncrypt = async () => {
    if (!file || !password) return;
    setLoading(true);
    try {
      // 1. 서버로부터 동적 Salt 발급을 요청합니다. (브라우저나 스토리지에 저장하지 않음)
      const saltRes = await fetch('/api/crypto/salt', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pms_token')}` }
      });
      if (!saltRes.ok) throw new Error("서버 Salt 발급 실패");
      const { salt: serverSaltArray } = await saltRes.json();
      const salt = new Uint8Array(serverSaltArray);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const enc = new TextEncoder();
          
          // 2. 서버 Salt와 사용자 Password를 조합하여 암호키(PBKDF2)를 생성합니다.
          const baseKey = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
          const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: CRYPTO_CONFIG.iterations, hash: "SHA-256" },
            baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
          );

          // 3. 임의의 IV 생성
          const iv = window.crypto.getRandomValues(new Uint8Array(12));
          // 4. 데이터 암호화
          const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

          // 5. 서버에서 받은 Salt, 로컬생성 IV, 암호문 형태(Salt + IV + CipherText)로 최종 패키징합니다.
          const blob = new Blob([salt, iv, encrypted], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          
          // 확인용 엑셀 파싱
          const workbook = XLSX.read(data, { type: 'array' });
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

          setResult({ url, name: `ENC_${file.name}.pms`, count: rows.length });
          await logSecurityAction("LOCAL_ENCRYPT", file.name, `파일 암호화 로컬 완료 (레코드: ${rows.length}건)`);

          onProcessComplete?.({
            type: 'ENCRYPT',
            fileName: file.name,
            records: rows.map(r => ({
              name: String(r['성명'] || r['이름'] || '미식별'),
              phone: String(r['연락처'] || r['전화번호'] || ''),
              email: String(r['이메일'] || ''),
              status: 'ENCRYPTED'
            }))
          });
        } catch (err) {
          alert("암호화 처리 중 오류: " + err.message);
        } finally {
          setLoading(false);
          // 민감 변수 초기화 (Closure 메모리 삭제)
          setPassword('');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("분산 암호화 준비 중 오류: " + err.message);
      setLoading(false);
    }
  };

  // --- 복호화 엔진 (분산형) ---
  const processDecrypt = async () => {
    if (!file || !password || !decryptReason) {
      alert("복호화 사유를 입력해야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          // 이전에 저장된 형태: [Salt(16) | IV(12) | CipherText]
          const salt = buffer.slice(0, 16);
          const iv = buffer.slice(16, 28);
          const data = buffer.slice(28);

          const enc = new TextEncoder();
          const baseKey = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
          const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: CRYPTO_CONFIG.iterations, hash: "SHA-256" },
            baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
          );

          const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
          const blob = new Blob([decrypted], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const url = URL.createObjectURL(blob);
          
          setResult({ url, name: file.name.replace('.pms', '').replace('ENC_', 'DEC_'), success: true });
          // 복호화 레코딩을 API로 전송. 이후 시스템 파이프라인에서 하드 딜리트로 연계 가능
          await logSecurityAction("LOCAL_DECRYPT", file.name, `복호화 수행 및 사유 승인: ${decryptReason}`);
        } catch (err) {
          alert("비밀번호가 틀렸거나 파일이 손상되었습니다. (알맞은 키오스크가 아닐 수 있습니다.)");
        } finally {
          setLoading(false);
          setPassword('');
          setDecryptReason('');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert("복호화 준비 중 오류");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <header className="flex items-center gap-4 mb-10">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-200"><Lock size={28} /></div>
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
                onClick={() => { setActiveMode(m.id); setResult(null); setFile(null); setPassword(''); setDecryptReason(''); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeMode === m.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </nav>

          {activeMode === 'guide' ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-left-5">
              <h3 className="text-xl font-black text-slate-800 italic uppercase flex items-center gap-2"><ShieldCheck className="text-blue-600" /> 기술적 보호 가이드</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">01</div>
                  <div><p className="font-black text-slate-800 text-sm mb-1 uppercase">고강도 암호화</p><p className="text-xs text-slate-500 font-medium leading-relaxed">AES-256-GCM 표준을 사용하며 모든 처리는 브라우저 로컬 메모리에서만 이루어집니다.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">02</div>
                  <div><p className="font-black text-slate-800 text-sm mb-1 uppercase">비밀번호 미저장</p><p className="text-xs text-slate-500 font-medium leading-relaxed">비밀번호는 어디에도 저장되지 않으며, 분실 시 복구가 절대 불가능합니다.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black italic">03</div>
                  <div><p className="font-black text-slate-800 text-sm mb-1 uppercase">행위 로그 자동화</p><p className="text-xs text-slate-500 font-medium leading-relaxed">복호화 시 입력한 사유는 보안 감사 로그에 실시간으로 기록되어 관리됩니다.</p></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in zoom-in-95">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">보안 대상 파일 ({activeMode === 'encrypt' ? '.xlsx, .csv' : '.pms'})</label>
                <div className="relative group">
                  <input type="file" onChange={handleFileChange} accept={activeMode === 'encrypt' ? ".xlsx, .csv" : ".pms"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`w-full py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 group-hover:border-blue-200'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm transition-colors ${file ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}><FileUp size={32} /></div>
                    <p className={`text-sm font-black ${file ? 'text-blue-600' : 'text-slate-400'}`}>{file ? file.name : '파일을 선택하거나 드래그하세요'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">금고 비밀번호</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상의 암호" className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-500 shadow-inner" />
                </div>
              </div>
              {activeMode === 'decrypt' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">복호화 사유 (필수)</label>
                  <textarea value={decryptReason} onChange={e => setDecryptReason(e.target.value)} placeholder="수행 사유를 입력하세요" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-500 min-h-[100px] resize-none shadow-inner" />
                </div>
              )}
              <button 
                onClick={activeMode === 'encrypt' ? processEncrypt : processDecrypt}
                disabled={loading || !file || !password || (activeMode === 'decrypt' && !decryptReason)}
                className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl uppercase italic ${loading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : (activeMode === 'encrypt' ? <Lock size={24} /> : <Unlock size={24} />)}
                {loading ? 'Processing...' : (activeMode === 'encrypt' ? 'Secure Encryption' : 'Secure Decryption')}
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 space-y-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] opacity-10"><Shield size={120} /></div>
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 italic">Vault Status</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>
                <p className="text-xs font-bold uppercase tracking-tight">{loading ? '작업 처리 중...' : '엔진 가동 중'}</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">현재 알고리즘</p>
                <p className="text-sm font-black italic">AES-256-GCM</p>
              </div>
            </div>
          </div>
          {result && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 animate-in zoom-in-95">
              <CheckCircle className="text-emerald-500 mb-4" size={32} />
              <h4 className="text-lg font-black text-slate-900 italic mb-2">Complete</h4>
              <p className="text-xs text-slate-500 font-bold mb-6">성공적으로 처리되었습니다. {result.count && `분석 데이터: ${result.count}건`}</p>
              <a href={result.url} download={result.name} className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-lg"><Download size={16} /> DOWNLOAD</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
