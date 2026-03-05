import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Lock, Unlock, Upload, Download, ShieldCheck, Trash2,
  FileText, Key, AlertTriangle, CheckCircle, X, RefreshCw,
  ChevronDown, Eye, EyeOff, FileLock, Check, Square, CheckSquare, MessageSquare, Info, BookOpen, ShieldAlert
} from 'lucide-react';

const CIPHER_OPTIONS = [
  { 
    id: 'aes256', 
    label: 'AES-256-GCM', 
    desc: '미 국방부 표준 알고리즘. 현존하는 가장 강력한 보안 수준을 제공합니다.', 
    level: '군사급',
    keyInfo: '32바이트 보안 키를 생성합니다. 키 분실 시 데이터 복구가 절대 불가능합니다.'
  },
  { 
    id: 'aes128', 
    label: 'AES-128-GCM', 
    desc: '표준 대칭키 암호화. 처리 속도가 빠르며 대용량 데이터 보안에 적합합니다.', 
    level: '강력',
    keyInfo: '16바이트 보안 키를 생성합니다.'
  },
  { 
    id: 'custom', 
    label: '패스프레이즈 (사용자 암호)', 
    desc: '사용자가 설정한 비밀번호로 키를 생성합니다. 기억하기 쉬운 방식입니다.', 
    level: '사용자정의',
    keyInfo: '설정한 비밀번호를 잊으시면 데이터를 복구할 수 없습니다.'
  },
];

const LEVEL_COLORS = { '군사급': 'bg-emerald-50 text-emerald-600 border-emerald-100', '강력': 'bg-blue-50 text-blue-600 border-blue-100', '사용자정의': 'bg-indigo-50 text-indigo-600 border-indigo-100' };
const SELECTED_COLORS = { '군사급': 'bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500', '강력': 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500', '사용자정의': 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500' };

// --- 유틸리티 함수 ---
function parseCSV(text) {
  const rows = []; let current = ''; let inQuotes = false; let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(current.trim()); current = ''; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        row.push(current.trim()); rows.push(row); row = []; current = '';
        if (ch === '\r') i++;
      } else { current += ch; }
    }
  }
  if (current || row.length > 0) { row.push(current.trim()); rows.push(row); }
  return rows;
}

async function parseXLSX(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

function arrayToCSV(data) {
  return data.map(row => row.map(cell => {
    const s = String(cell ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

const buf2hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
const hex2buf = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

async function encryptCellValue(val, key) {
  if (!val && val !== 0) return val;
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(String(val)));
  return 'ENC:' + buf2hex(iv) + buf2hex(ct);
}

async function decryptCellValue(val, key) {
  if (typeof val !== 'string' || !val.startsWith('ENC:')) return val;
  try {
    const raw = val.slice(4);
    const iv = hex2buf(raw.slice(0, 24));
    const ct = hex2buf(raw.slice(24));
    const dt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(dt);
  } catch { return '!!복호화실패!!'; }
}

async function deriveKeyFromPass(pass, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

// === 보안 금고(암/복호화) 컴포넌트 ===
export default function SecurityVault({ onProcessComplete }) {
  const [activeView, setActiveView] = useState('main'); 
  const [mode, setMode] = useState('encrypt'); 
  const [selectedCipher, setSelectedCipher] = useState('aes256');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [reason, setReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [allData, setAllData] = useState([]);
  const [selectedCols, setSelectedCols] = useState(new Set());
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [keyBlobUrl, setKeyBlobUrl] = useState(null);
  
  const fileRef = useRef(null);
  const keyRef = useRef(null);

  const handleFile = async (file, isKey = false) => {
    if (!file) return;
    if (isKey) { setKeyFile(file); return; }
    
    const ext = file.name.split('.').pop().toLowerCase();
    setUploadedFile(file);
    setPhase('loading');
    try {
      const data = (ext === 'xlsx' || ext === 'xls') ? await parseXLSX(await file.arrayBuffer()) : parseCSV(await file.text());
      if (data.length === 0) throw new Error('데이터가 없는 파일입니다.');
      setAllData(data);
      setSelectedCols(new Set(data[0].map((_, i) => i)));
      setPhase('selecting');
    } catch (e) { setErrorMsg(e.message); setPhase('idle'); }
  };

  const handleProcess = async () => {
    if (!reason.trim()) { setErrorMsg('보안 감사를 위해 수행 사유를 반드시 입력해야 합니다.'); return; }
    if (mode === 'decrypt' && !keyFile) { setErrorMsg('복호화를 위한 보안 키 파일을 업로드하십시오.'); return; }
    
    setPhase('processing');
    setProgress(0);

    try {
      let cryptoKey = null;
      let exportedHex = null;

      if (mode === 'encrypt') {
        if (selectedCipher === 'custom') {
          const salt = 'pms-' + Date.now();
          cryptoKey = await deriveKeyFromPass(passphrase, salt);
          exportedHex = `PASSPHRASE:${salt}`;
        } else {
          cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: selectedCipher === 'aes256' ? 256 : 128 }, true, ['encrypt', 'decrypt']);
          exportedHex = buf2hex(await crypto.subtle.exportKey('raw', cryptoKey));
        }
      } else {
        const keyText = await keyFile.text();
        const hexMatch = keyText.match(/KEY:\s*([0-9a-f]{32,})/i);
        const passMatch = keyText.match(/KEY:\s*PASSPHRASE:(pms-\d+)/i);

        if (passMatch) {
          const inputPass = prompt('이 파일의 암호화 시 사용한 비밀번호를 입력하세요.');
          if (!inputPass) throw new Error('비밀번호가 입력되지 않았습니다.');
          cryptoKey = await deriveKeyFromPass(inputPass, passMatch[1]);
        } else if (hexMatch) {
          cryptoKey = await crypto.subtle.importKey('raw', hex2buf(hexMatch[1]), 'AES-GCM', false, ['decrypt']);
        } else { throw new Error('유효한 보안 키 형식이 아닙니다.'); }
      }

      // 헤더 분석 (회원 DB 연동을 위한 인덱스 찾기)
      const headers = allData[0].map(h => String(h).toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('성명') || h.includes('이름') || h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('메일') || h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('전화') || h.includes('휴대폰') || h.includes('phone') || h.includes('tel'));

      const processedRows = [allData[0]];
      const recordsForDB = [];
      let done = 0;
      const total = (allData.length - 1) * selectedCols.size;

      for (let ri = 1; ri < allData.length; ri++) {
        const row = [...allData[ri]];
        for (let ci = 0; ci < row.length; ci++) {
          if (selectedCols.has(ci)) {
            row[ci] = mode === 'encrypt' ? await encryptCellValue(row[ci], cryptoKey) : await decryptCellValue(row[ci], cryptoKey);
            done++;
            if (done % 50 === 0) {
              setProgress(Math.floor((done / total) * 100));
              await new Promise(r => setTimeout(r, 1));
            }
          }
        }
        processedRows.push(row);
        
        // 회원 DB 연동용 레코드 가공
        recordsForDB.push({
          name: nameIdx !== -1 ? row[nameIdx] : '미지정',
          email: emailIdx !== -1 ? row[emailIdx] : '',
          phone: phoneIdx !== -1 ? row[phoneIdx] : '',
          status: mode === 'encrypt' ? 'ENCRYPTED' : 'DECRYPTED'
        });
      }

      const blob = new Blob(['\uFEFF' + arrayToCSV(processedRows)], { type: 'text/csv;charset=utf-8' });
      setResultBlobUrl(URL.createObjectURL(blob));

      if (mode === 'encrypt') {
        const kt = `=== PMS Center 보안 키 파일 ===\n생성일시: ${new Date().toLocaleString()}\n알고리즘: ${selectedCipher}\n대상파일: ${uploadedFile.name}\n수행사유: ${reason}\nKEY: ${exportedHex}\n----------------------------\n주의: 이 파일이 없으면 절대 복호화할 수 없습니다.\nCERT 보안팀`;
        setKeyBlobUrl(URL.createObjectURL(new Blob([kt], { type: 'text/plain' })));
      }

      // 로그 기록
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pms_token')}` },
        body: JSON.stringify({ action: mode.toUpperCase(), target: uploadedFile.name, reason, details: `${recordsForDB.length}명 데이터 처리` })
      });

      setPhase('done');
      if (onProcessComplete) onProcessComplete({ records: recordsForDB });
    } catch (e) { setErrorMsg('처리 오류: ' + e.message); setPhase('selecting'); }
  };

  if (activeView === 'guide') return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <BookOpen size={36} className="text-blue-600" /> 보안 가이드
        </h2>
        <button onClick={() => setActiveView('main')} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs">돌아가기</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-slate-800 italic uppercase">1. 암호화 알고리즘 안내</h3>
          <div className="space-y-6">
            {CIPHER_OPTIONS.map(opt => (
              <div key={opt.id} className="border-l-4 border-blue-500 pl-6 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg text-slate-900">{opt.label}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${LEVEL_COLORS[opt.level]}`}>{opt.level}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{opt.desc}</p>
                <p className="text-xs text-blue-600 font-bold bg-blue-50 p-3 rounded-xl flex gap-2"><Info size={14}/> {opt.keyInfo}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl space-y-6">
          <h3 className="text-2xl font-black italic uppercase text-blue-400">2. 데이터 연동 절차</h3>
          <p className="text-sm text-slate-400 font-medium">암호화 또는 복호화가 완료된 데이터는 자동으로 '회원 DB 관리' 탭으로 전송되어 이력이 남습니다. 이때 엑셀의 헤더(성명, 이메일, 전화번호)를 기준으로 데이터를 분석합니다.</p>
          <div className="space-y-4 pt-4">
            {['파일 업로드 및 열 선택', '보안 감사 사유 입력', '알고리즘 및 키 설정', '결과 다운로드 및 DB 자동 연동'].map((s, i) => (
              <div key={i} className="flex gap-4 items-center">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-blue-400 text-sm">{i+1}</span>
                <p className="font-black text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <FileLock size={36} className="text-blue-600" /> 보안 금고
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('guide')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-black text-xs uppercase"><BookOpen size={16}/> 가이드</button>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => {setMode('encrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'encrypt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>암호화</button>
            <button onClick={() => {setMode('decrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'decrypt' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>복호화</button>
          </div>
        </div>
      </div>

      {errorMsg && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3"><AlertTriangle className="text-rose-500" size={18}/><p className="text-rose-700 text-sm font-medium">{errorMsg}</p><X className="ml-auto cursor-pointer" onClick={()=>setErrorMsg('')} size={16}/></div>}

      {phase === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => fileRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-blue-50/30 transition-all border-slate-200">
            <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <FileText size={48} className="mx-auto mb-4 text-blue-400" />
            <h3 className="font-black text-slate-700 text-xl uppercase italic">{uploadedFile ? uploadedFile.name : '대상 파일 업로드'}</h3>
            <p className="text-slate-400 text-sm font-medium">데이터 원본 또는 암호화 파일 (.csv, .xlsx)</p>
          </div>
          {mode === 'decrypt' && (
            <div onClick={() => keyRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-emerald-50/30 transition-all border-slate-200">
              <input ref={keyRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0], true)} />
              <Key size={48} className="mx-auto mb-4 text-emerald-400" />
              <h3 className="font-black text-slate-700 text-xl uppercase italic">{keyFile ? keyFile.name : '보안 키 업로드'}</h3>
              <p className="text-slate-400 text-sm font-medium">암호화 시 발급받은 .txt 키 파일</p>
            </div>
          )}
        </div>
      )}

      {phase === 'selecting' && (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in zoom-in-95">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-blue-500" /> 보안 처리 정보</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">수행 사유 (필수)</span>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="보안 규정에 따른 처리 목적을 입력하십시오." className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all" />
                </label>
                {mode === 'encrypt' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">알고리즘 선택</span>
                    <div className="grid grid-cols-1 gap-2">
                      {CIPHER_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setSelectedCipher(opt.id)} className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedCipher === opt.id ? SELECTED_COLORS[opt.level] : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                          <div className="flex justify-between mb-1"><span className="font-black text-sm uppercase italic">{opt.label}</span><span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${LEVEL_COLORS[opt.level]}`}>{opt.level}</span></div>
                          <p className="text-[11px] text-slate-400 font-medium">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                    {selectedCipher === 'custom' && (
                      <div className="relative animate-in slide-in-from-top-2">
                        <input type={showPass ? 'text' : 'password'} value={passphrase} onChange={e => setPassphrase(e.target.value)} placeholder="복호화 비밀번호 설정" className="w-full px-5 py-3 pr-10 bg-indigo-50/50 border border-indigo-100 rounded-xl outline-none text-sm font-black focus:ring-4 focus:ring-indigo-100" />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><CheckSquare size={14} className="text-emerald-500" />데이터 미리보기</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[400px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0"><tr>{allData[0]?.map((h, i) => <th key={i} className="py-3 px-4 font-black text-slate-400 border-b">{h || `열 ${i+1}`}</th>)}</tr></thead>
                  <tbody>{allData.slice(1, 10).map((row, ri) => <tr key={ri} className="border-b border-slate-50">{row.map((cell, ci) => <td key={ci} className="py-3 px-4 text-slate-600 truncate max-w-[120px]">{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
              <button onClick={handleProcess} className={`w-full py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${mode === 'encrypt' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {mode === 'encrypt' ? <Lock /> : <Unlock />} {mode === 'encrypt' ? '암호화 실행' : '복호화 실행'}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-slate-100">
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-spin"><RefreshCw size={48} className="text-blue-600" /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4">{mode === 'encrypt' ? '보안 암호화 중...' : '데이터 복구 중...'}</h3>
          <div className="max-w-md mx-auto h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <p className="mt-4 font-black text-blue-600 italic tabular-nums">{progress}%</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-emerald-100 shadow-2xl animate-in zoom-in">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-8 animate-bounce" />
          <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-2">{mode === 'encrypt' ? '암호화 완료' : '복호화 완료'}</h3>
          <p className="text-slate-400 font-medium mb-12">처리된 결과는 자동으로 회원 DB에 기록되었습니다. 키 파일을 안전하게 저장하십시오.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={resultBlobUrl} download={(mode==='encrypt'?'보안_':'복구_')+uploadedFile.name.replace(/\.\w+$/, '')+'.csv'} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition flex items-center justify-center gap-3 shadow-xl"><Download /> 결과 파일 다운로드</a>
            {keyBlobUrl && <a href={keyBlobUrl} download={'보안키_'+uploadedFile.name+'.txt'} className="px-10 py-5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl font-black hover:bg-indigo-100 transition flex items-center justify-center gap-3 shadow-lg"><Key /> 보안 키 저장</a>}
          </div>
          <button onClick={() => setPhase('idle')} className="text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition tracking-[0.2em]">새로운 보안 작업 시작 →</button>
        </div>
      )}
    </div>
  );
}
