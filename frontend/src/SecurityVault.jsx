import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Lock, Unlock, Upload, Download, ShieldCheck, Trash2,
  FileText, Key, AlertTriangle, CheckCircle, X, RefreshCw,
  ChevronDown, Eye, EyeOff, FileLock, Check, Square, CheckSquare, MessageSquare
} from 'lucide-react';

const CIPHER_OPTIONS = [
  { id: 'aes256', label: 'AES-256-GCM', desc: 'NIST 권장 군사급 대칭키 암호화.', level: 'MILITARY' },
  { id: 'aes128', label: 'AES-128-GCM', desc: '경량 대칭키 암호화. 빠른 속도.', level: 'STRONG' },
  { id: 'custom', label: '패스프레이즈 기반', desc: 'PBKDF2(SHA-256) 키 파생.', level: 'CUSTOM' },
];

const LEVEL_COLORS = { MILITARY: 'bg-emerald-50 text-emerald-600 border-emerald-100', STRONG: 'bg-blue-50 text-blue-600 border-blue-100', CUSTOM: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
const SELECTED_COLORS = { MILITARY: 'bg-emerald-50/50 border-emerald-200', STRONG: 'bg-blue-50/50 border-blue-200', CUSTOM: 'bg-indigo-50/50 border-indigo-200' };

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

export default function SecurityVault({ onProcessComplete }) {
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [selectedCipher, setSelectedCipher] = useState('aes256');
  const [passphrase, setPassphrase] = useState('');
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
    if (!reason.trim()) { setErrorMsg('수행 사유를 입력해 주세요.'); return; }
    if (mode === 'decrypt' && !keyFile) { setErrorMsg('복호화용 키 파일을 업로드해 주세요.'); return; }
    
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
        const hexMatch = keyText.match(/[0-9a-f]{32,}/i);
        if (!hexMatch) throw new Error('유효한 키를 찾을 수 없습니다.');
        cryptoKey = await crypto.subtle.importKey('raw', hex2buf(hexMatch[0]), 'AES-GCM', false, ['decrypt']);
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
              if (done % 10 === 0) await new Promise(r => setTimeout(r, 10));
            }
          }
        }
        processed.push(row);
      }

      setResultData(processed);
      const blob = new Blob(['\uFEFF' + arrayToCSV(processed)], { type: 'text/csv;charset=utf-8' });
      setResultBlobUrl(URL.createObjectURL(blob));

      if (mode === 'encrypt' && exportedHex) {
        const kt = `=== PMS Center 보안 키 ===\n방식: ${selectedCipher}\n원본: ${uploadedFile.name}\nKEY: ${exportedHex}\nCERT 보안팀`;
        setKeyBlobUrl(URL.createObjectURL(new Blob([kt], { type: 'text/plain' })));
      }

      await logActivity(mode.toUpperCase(), uploadedFile.name, done);
      setPhase('done');
      if (onProcessComplete) onProcessComplete({ filename: uploadedFile.name, action: mode, count: done });
    } catch (e) { setErrorMsg('처리 중 오류: ' + e.message); setPhase('selecting'); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <FileLock size={36} className="text-blue-600" /> Security Vault
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button onClick={() => {setMode('encrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'encrypt' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>ENCRYPT</button>
          <button onClick={() => {setMode('decrypt'); setPhase('idle');}} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'decrypt' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>DECRYPT</button>
        </div>
      </div>

      {errorMsg && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3"><AlertTriangle className="text-rose-500" size={18}/><p className="text-rose-700 text-sm font-medium">{errorMsg}</p><X className="ml-auto cursor-pointer" onClick={()=>setErrorMsg('')} size={16}/></div>}

      {phase === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => fileRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-blue-50/30 transition-all border-slate-200">
            <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <FileText size={48} className="mx-auto mb-4 text-blue-400" />
            <h3 className="font-black text-slate-700 text-xl italic uppercase">데이터 파일 업로드</h3>
            <p className="text-slate-400 text-sm">암호화/복호화할 대상 파일 (.csv, .xlsx)</p>
          </div>
          {mode === 'decrypt' && (
            <div onClick={() => keyRef.current?.click()} className="bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer hover:bg-emerald-50/30 transition-all border-slate-200">
              <input ref={keyRef} type="file" className="hidden" onChange={e => handleFile(e.target.files[0], true)} />
              <Key size={48} className="mx-auto mb-4 text-emerald-400" />
              <h3 className="font-black text-slate-700 text-xl italic uppercase">{keyFile ? keyFile.name : '보안 키 업로드'}</h3>
              <p className="text-slate-400 text-sm">발급받았던 .txt 키 파일</p>
            </div>
          )}
        </div>
      )}

      {phase === 'selecting' && (
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-blue-500" />수행 정보 입력</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">작업 사유 (로그 기록용)</span>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="예: 정기 보안 감사 대응, 외부 업체 데이터 제공 등..." className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-blue-100 transition-all" />
                </label>
                {mode === 'encrypt' && (
                  <div className="grid grid-cols-1 gap-2">
                    {CIPHER_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => setSelectedCipher(opt.id)} className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedCipher === opt.id ? SELECTED_COLORS[opt.level] : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <div className="flex justify-between mb-1"><span className="font-black text-sm uppercase italic">{opt.label}</span><span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${LEVEL_COLORS[opt.level]}`}>{opt.level}</span></div>
                        <p className="text-[11px] text-slate-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase italic text-xs tracking-widest flex items-center gap-2"><CheckSquare size={14} className="text-emerald-500" />대상 데이터 확인</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[400px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0"><tr>{allData[0]?.map((h, i) => <th key={i} className="py-3 px-4 font-black text-slate-400 uppercase border-b">{h || `Col ${i+1}`}</th>)}</tr></thead>
                  <tbody>{allData.slice(1, 10).map((row, ri) => <tr key={ri} className="border-b border-slate-50">{row.map((cell, ci) => <td key={ci} className="py-3 px-4 text-slate-600 truncate max-w-[120px]">{cell}</td>)}</tr>)}</tbody>
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
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-spin"><RefreshCw size={48} className="text-blue-600" /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-4">{mode === 'encrypt' ? '보안 암호화 중' : '데이터 복호화 중'}</h3>
          <div className="max-w-md mx-auto h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <p className="mt-4 font-black text-blue-600 italic tabular-nums">{progress}%</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-emerald-100 shadow-2xl shadow-emerald-900/5 animate-in zoom-in duration-500">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-8" />
          <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-2">{mode === 'encrypt' ? 'Encryption Success' : 'Decryption Success'}</h3>
          <p className="text-slate-400 font-medium mb-12">보안 처리가 완료되었습니다. 로그가 감사 시스템에 기록되었습니다.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={resultBlobUrl} download={(mode==='encrypt'?'SECURED_':'RESTORED_')+uploadedFile.name.replace(/\.\w+$/, '')+'.csv'} className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition flex items-center justify-center gap-3"><Download /> 파일 다운로드</a>
            {keyBlobUrl && <a href={keyBlobUrl} download={'KEY_'+uploadedFile.name+'.txt'} className="px-10 py-5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl font-black hover:bg-indigo-100 transition flex items-center justify-center gap-3"><Key /> 키 파일 보관</a>}
          </div>
          <button onClick={() => setPhase('idle')} className="text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition tracking-[0.2em]">새로운 작업 시작하기 →</button>
        </div>
      )}
    </div>
  );
}

async function deriveKeyFromPass(pass, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
