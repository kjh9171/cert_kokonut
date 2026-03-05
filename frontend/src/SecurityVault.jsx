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
    desc: 'NIST(미국표준기술연구소) 권장 군사급 알고리즘. 현존하는 가장 강력한 대칭키 암호화 방식입니다.', 
    level: 'MILITARY',
    keyInfo: '32바이트(256비트) 랜덤 바이너리 키를 생성합니다. 키 파일 분실 시 절대 복구 불가능합니다.'
  },
  { 
    id: 'aes128', 
    label: 'AES-128-GCM', 
    desc: '표준 대칭키 암호화 방식. 성능과 보안의 균형이 뛰어나며 대량의 데이터 처리에 적합합니다.', 
    level: 'STRONG',
    keyInfo: '16바이트(128비트) 랜덤 바이너리 키를 생성합니다.'
  },
  { 
    id: 'custom', 
    label: 'PBKDF2 (패스프레이즈)', 
    desc: '사용자가 설정한 비밀번호로부터 키를 파생합니다. 사람이 기억하기 쉬운 보안 방식입니다.', 
    level: 'CUSTOM',
    keyInfo: '사용자 비밀번호 + 고유 Salt 조합으로 키를 생성합니다. 비밀번호를 잊으면 복구할 수 없습니다.'
  },
];

const LEVEL_COLORS = { MILITARY: 'bg-emerald-50 text-emerald-600 border-emerald-100', STRONG: 'bg-blue-50 text-blue-600 border-blue-100', CUSTOM: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
const SELECTED_COLORS = { MILITARY: 'bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500', STRONG: 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500', CUSTOM: 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500' };

// --- 헬퍼 함수들은 이전과 동일 ---
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
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
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
  } catch { return '!!DECRYPT_FAILED!!'; }
}

async function deriveKeyFromPass(pass, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

// === SecurityVault 메인 컴포넌트 ===
export default function SecurityVault({ onProcessComplete }) {
  const [activeView, setActiveView] = useState('main'); // 'main' | 'guide'
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [selectedCipher, setSelectedCipher] = useState('aes256');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [reason, setReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [allData, setAllData] = useState([]);
  const [selectedCols, setSelectedCols] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [keyBlobUrl, setKeyBlobUrl] = useState(null);
  const [resultData, setResultData] = useState([]);
  
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
      setAllData(data);
      setSelectedCols(new Set(data[0].map((_, i) => i)));
      setSelectedRows(new Set(data.slice(1).map((_, i) => i)));
      setPhase('selecting');
    } catch { setErrorMsg('파일 파싱 실패'); setPhase('idle'); }
  };

  const logActivity = async (action, target, count) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pms_token')}` },
        body: JSON.stringify({ action, target, reason, details: `${count}개 데이터 처리` })
      });
    } catch (e) { console.error('로그 기록 실패', e); }
  };

  const handleProcess = async () => {
    if (!reason.trim()) { setErrorMsg('보안 감사를 위해 수행 사유를 반드시 입력해 주세요.'); return; }
    if (mode === 'decrypt' && !keyFile) { setErrorMsg('복호화용 키 파일을 업로드해 주세요.'); return; }
    if (mode === 'encrypt' && selectedCipher === 'custom' && passphrase.length < 4) { setErrorMsg('패스프레이즈는 최소 4자 이상이어야 합니다.'); return; }
    
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
          const inputPass = prompt('해당 파일 암호화 시 사용한 패스프레이즈를 입력하십시오.');
          if (!inputPass) throw new Error('패스프레이즈가 입력되지 않았습니다.');
          cryptoKey = await deriveKeyFromPass(inputPass, passMatch[1]);
        } else if (hexMatch) {
          cryptoKey = await crypto.subtle.importKey('raw', hex2buf(hexMatch[1]), 'AES-GCM', false, ['decrypt']);
        } else {
          throw new Error('유효한 보안 키를 찾을 수 없습니다. (KEY: 형식 확인)');
        }
      }

      const processed = [allData[0]];
      let done = 0;
      const total = selectedRows.size * selectedCols.size;

      for (let ri = 0; ri < allData.length - 1; ri++) {
        const row = [...allData[ri + 1]];
        if (selectedRows.has(ri)) {
          for (let ci = 0; ci < row.length; ci++) {
            if (selectedCols.has(ci)) {
              row[ci] = mode === 'encrypt' ? await encryptCellValue(row[ci], cryptoKey) : await decryptCellValue(row[ci], cryptoKey);
              done++;
              setProgress(Math.floor((done / total) * 100));
              if (done % 50 === 0) await new Promise(r => setTimeout(r, 1));
            }
          }
        }
        processed.push(row);
      }

      setResultData(processed);
      const blob = new Blob(['\uFEFF' + arrayToCSV(processed)], { type: 'text/csv;charset=utf-8' });
      setResultBlobUrl(URL.createObjectURL(blob));

      if (mode === 'encrypt' && exportedHex) {
        const kt = `=== PMS Center 보안 키 파일 ===\n생성일시: ${new Date().toLocaleString()}\n방식: ${selectedCipher}\n원본파일: ${uploadedFile.name}\n사유: ${reason}\nKEY: ${exportedHex}\n----------------------------\n주의: 이 키 없이는 데이터 복구가 불가능합니다.\nPMS Center CERT 보안팀`;
        setKeyBlobUrl(URL.createObjectURL(new Blob([kt], { type: 'text/plain' })));
      }

      await logActivity(mode.toUpperCase(), uploadedFile.name, done);
      setPhase('done');
      if (onProcessComplete) onProcessComplete({ filename: uploadedFile.name, action: mode, count: done });
    } catch (e) { setErrorMsg('처리 중 오류: ' + e.message); setPhase('selecting'); }
  };

  // --- 가이드 뷰 ---
  if (activeView === 'guide') return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <BookOpen size={36} className="text-blue-600" /> Security Guide
        </h2>
        <button onClick={() => setActiveView('main')} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest">Back to Vault</button>
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
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{opt.desc}</p>
                <p className="text-xs text-blue-600 font-bold bg-blue-50 p-3 rounded-xl flex gap-2"><Info size={14}/> {opt.keyInfo}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black italic uppercase text-blue-400">2. 표준 수행 절차</h3>
            <div className="space-y-4">
              {[
                { t: '데이터 준비', d: '개인정보가 포함된 .csv 또는 .xlsx 파일을 준비합니다.' },
                { t: '필드 선택', d: '암호화가 필요한 특정 열(성명, 전화번호 등)만 골라 처리할 수 있습니다.' },
                { t: '감사 정보 입력', d: '보안 규정에 따라 작업 사유를 명확히 기록해야 합니다.' },
                { t: '키 파일 보관', d: '암호화 완료 후 생성된 .txt 키 파일은 물리적으로 분리된 안전한 곳에 보관하십시오.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-blue-400 text-sm">{i+1}</span>
                  <div>
                    <p className="font-black text-sm">{step.t}</p>
                    <p className="text-xs text-slate-400 mt-1">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-rose-600 font-black italic uppercase flex items-center gap-2"><ShieldAlert size={20}/> 복호화 실패 시 체크리스트</h3>
            <ul className="text-xs text-rose-700 font-medium space-y-2 leading-relaxed">
              <li>• 암호화 시 사용했던 원본 알고리즘(AES-256 등)과 키 파일이 일치합니까?</li>
              <li>• 키 파일의 텍스트 내용(KEY: 부분)이 변조되지 않았습니까?</li>
              <li>• 패스프레이즈 방식인 경우, 암호화 시 입력했던 비밀번호와 정확히 일치합니까?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // --- 메인 볼트 뷰 ---
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <FileLock size={36} className="text-blue-600" /> Security Vault
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('guide')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"><BookOpen size={16}/> Guide</button>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button onClick={() => {setMode('encrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'encrypt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>ENCRYPT</button>
            <button onClick={() => {setMode('decrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'decrypt' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>DECRYPT</button>
          </div>
        </div>
      </div>

      {errorMsg && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3 animate-in shake duration-300"><AlertTriangle className="text-rose-500" size={18}/><p className="text-rose-700 text-sm font-medium">{errorMsg}</p><X className="ml-auto cursor-pointer text-rose-300" onClick={()=>setErrorMsg('')} size={16}/></div>}

      {phase === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => fileRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-blue-50/30 transition-all border-slate-200 shadow-sm group">
            <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <FileText size={48} className="mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-slate-700 text-xl italic uppercase">{uploadedFile ? uploadedFile.name : '데이터 파일 업로드'}</h3>
            <p className="text-slate-400 text-sm font-medium">처리가 필요한 원본 또는 암호화 파일 (.csv, .xlsx)</p>
          </div>
          {mode === 'decrypt' && (
            <div onClick={() => keyRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-emerald-50/30 transition-all border-slate-200 shadow-sm group">
              <input ref={keyRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0], true)} />
              <Key size={48} className="mx-auto mb-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-slate-700 text-xl italic uppercase">{keyFile ? keyFile.name : '보안 키 업로드'}</h3>
              <p className="text-slate-400 text-sm font-medium">암호화 시 발급받았던 전용 .txt 키 파일</p>
            </div>
          )}
        </div>
      )}

      {phase === 'selecting' && (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-blue-500" />보안 감사 정보</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">작업 사유 (필수)</span>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="보안 규정에 따른 처리 목적을 상세히 입력해 주십시오." className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all" />
                </label>
                {mode === 'encrypt' && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">암호화 알고리즘 선택</span>
                    <div className="grid grid-cols-1 gap-2">
                      {CIPHER_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setSelectedCipher(opt.id)} className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedCipher === opt.id ? SELECTED_COLORS[opt.level] : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                          <div className="flex justify-between mb-1">
                            <span className={`font-black text-sm uppercase italic ${selectedCipher === opt.id ? 'text-slate-900' : 'text-slate-500'}`}>{opt.label}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${LEVEL_COLORS[opt.level]}`}>{opt.level}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                    {selectedCipher === 'custom' && (
                      <div className="mt-4 animate-in slide-in-from-top-2">
                        <div className="relative">
                          <input type={showPass ? 'text' : 'password'} value={passphrase} onChange={e => setPassphrase(e.target.value)} placeholder="복호화에 사용할 비밀번호 설정" className="w-full px-5 py-3 pr-10 bg-indigo-50/50 border border-indigo-100 rounded-xl outline-none text-sm font-black focus:ring-4 focus:ring-indigo-100 transition-all" />
                          <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><CheckSquare size={14} className="text-emerald-500" />대상 데이터 미리보기</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[400px] shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0"><tr>{allData[0]?.map((h, i) => <th key={i} className="py-3 px-4 font-black text-slate-400 uppercase border-b">{h || `Col ${i+1}`}</th>)}</tr></thead>
                  <tbody>{allData.slice(1, 10).map((row, ri) => <tr key={ri} className="border-b border-slate-50 font-medium">{row.map((cell, ci) => <td key={ci} className="py-3 px-4 text-slate-600 truncate max-w-[120px]">{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
              <button onClick={handleProcess} className={`w-full py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${mode === 'encrypt' ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}>
                {mode === 'encrypt' ? <Lock /> : <Unlock />} {mode.toUpperCase()} 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-slate-100">
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-spin shadow-inner"><RefreshCw size={48} className="text-blue-600" /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4 tracking-tighter">{mode === 'encrypt' ? 'Secure Encrypting' : 'Data Restoring'}</h3>
          <div className="max-w-md mx-auto h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-600 transition-all duration-300 shadow-lg" style={{ width: `${progress}%` }} /></div>
          <p className="mt-4 font-black text-blue-600 italic tabular-nums">{progress}%</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-emerald-100 shadow-2xl shadow-emerald-900/5 animate-in zoom-in duration-500">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-8 animate-bounce" />
          <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">{mode === 'encrypt' ? 'Encryption Success' : 'Restoration Success'}</h3>
          <p className="text-slate-400 font-medium mb-12">작업이 완료되었습니다. 처리 결과 파일과 보안 키를 즉시 저장하십시오.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={resultBlobUrl} download={(mode==='encrypt'?'SECURED_':'RESTORED_')+uploadedFile.name.replace(/\.\w+$/, '')+'.csv'} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"><Download /> 결과 파일 다운로드</a>
            {keyBlobUrl && <a href={keyBlobUrl} download={'KEY_'+uploadedFile.name+'.txt'} className="px-10 py-5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl font-black hover:bg-indigo-100 transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"><Key /> 보안 키 다운로드</a>}
          </div>
          <button onClick={() => setPhase('idle')} className="text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition tracking-[0.2em] border-b border-transparent hover:border-slate-300">새로운 보안 작업 시작하기 →</button>
        </div>
      )}
    </div>
  );
}
