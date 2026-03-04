import React, { useState, useRef } from 'react';
// 보안 금고 전용 아이콘 세트
import {
  Lock, Upload, Download, ShieldCheck, Trash2,
  FileText, Key, AlertTriangle, CheckCircle, X, RefreshCw,
  ChevronDown, Eye, EyeOff, FileLock, Check, Square, CheckSquare
} from 'lucide-react';

// --- 암호화 방식 선택 옵션 ---
const CIPHER_OPTIONS = [
  { id: 'aes256', label: 'AES-256-GCM', desc: 'NIST 권장 군사급 대칭키 암호화.', level: 'MILITARY' },
  { id: 'aes128', label: 'AES-128-GCM', desc: '경량 대칭키 암호화. 빠른 속도.', level: 'STRONG' },
  { id: 'custom', label: '패스프레이즈 기반', desc: 'PBKDF2(SHA-256) 키 파생.', level: 'CUSTOM' },
  { id: 'mask',   label: '마스킹 (비가역)', desc: '*** 형식 치환. 복원 불가.', level: 'BASIC' },
];

// 레벨별 뱃지 색상 클래스
const LEVEL_COLORS = {
  MILITARY: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  STRONG: 'bg-blue-50 text-blue-600 border-blue-100',
  CUSTOM: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  BASIC: 'bg-amber-50 text-amber-600 border-amber-100',
};
// 선택됨 카드 색상
const SELECTED_COLORS = {
  MILITARY: 'bg-emerald-50/50 border-emerald-200',
  STRONG: 'bg-blue-50/50 border-blue-200',
  CUSTOM: 'bg-indigo-50/50 border-indigo-200',
  BASIC: 'bg-amber-50/50 border-amber-200',
};

// --- 순수 JS CSV 파서 (외부 라이브러리 의존 제거) ---
function parseCSV(text) {
  // CSV 텍스트를 2차원 배열로 파싱 (쉼표 구분, 따옴표 처리)
  const rows = [];
  let current = '';
  let inQuotes = false;
  let row = [];
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
  // 빈 마지막 행 제거
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}

// --- 엑셀(xlsx) 파싱: CDN에서 SheetJS 동적 로딩 ---
async function parseXLSX(arrayBuffer) {
  // 전역에 이미 로딩되었는지 확인
  if (!window.XLSX) {
    // CDN에서 SheetJS 라이브러리 동적 로딩
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('SheetJS CDN 로딩 실패'));
      document.head.appendChild(script);
    });
  }
  const wb = window.XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

// --- 2차원 배열 → CSV 문자열 변환 ---
function arrayToCSV(data) {
  return data.map(row =>
    row.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
    }).join(',')
  ).join('\n');
}

// --- Web Crypto API 암호화 유틸리티 ---
const buf2hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

async function deriveKeyFromPass(pass, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
}

async function generateAESKey(bits) {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: bits }, true, ['encrypt']);
}

async function encryptCellValue(val, key) {
  if (val === null || val === undefined || val === '') return val;
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(String(val)));
  return 'ENC:' + buf2hex(iv) + buf2hex(ct);
}

function maskCellValue(val) {
  if (!val && val !== 0) return val;
  const s = String(val);
  if (s.length <= 2) return '***';
  return s[0] + '*'.repeat(Math.max(s.length - 2, 3)) + s[s.length - 1];
}

// === SecurityVault 메인 컴포넌트 ===
export default function SecurityVault({ onProcessComplete }) {
  // 암호화 설정
  const [selectedCipher, setSelectedCipher] = useState('aes256');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  // 파일 상태
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);
  // 데이터 및 선택
  const [allData, setAllData] = useState([]);
  const [selectedCols, setSelectedCols] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  // 처리 단계: idle | loading | selecting | processing | done | shredded
  const [phase, setPhase] = useState('idle');
  const [processingCell, setProcessingCell] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  // 결과
  const [resultBlobUrl, setResultBlobUrl] = useState(null);
  const [keyBlobUrl, setKeyBlobUrl] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [stats, setStats] = useState({ rows: 0, cells: 0 });

  // 파일 후처리 핸들러
  const processFileData = (data, file) => {
    if (!data || data.length < 2) {
      setErrorMsg('파일에 데이터가 부족합니다. 헤더 + 최소 1행이 필요합니다.');
      setPhase('idle');
      setUploadedFile(null);
      return;
    }
    setAllData(data);
    setSelectedCols(new Set(data[0].map((_, i) => i)));
    setSelectedRows(new Set(data.slice(1).map((_, i) => i)));
    setErrorMsg('');
    setPhase('selecting');
  };

  // 파일 선택 핸들러
  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'tsv', 'txt'].includes(ext)) {
      setErrorMsg('지원하지 않는 형식입니다. xlsx, xls, csv 파일을 업로드해 주세요.');
      return;
    }

    setUploadedFile(file);
    setPhase('loading');
    setErrorMsg('');
    setResultBlobUrl(null);
    setKeyBlobUrl(null);
    setResultData([]);
    setSelectedCols(new Set());
    setSelectedRows(new Set());

    try {
      if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        // CSV/TSV: 텍스트로 읽어서 순수 JS로 파싱
        const text = await file.text();
        const data = parseCSV(text);
        processFileData(data, file);
      } else {
        // XLSX/XLS: CDN에서 SheetJS 동적 로딩 후 파싱
        const arrayBuffer = await file.arrayBuffer();
        const data = await parseXLSX(arrayBuffer);
        processFileData(data, file);
      }
    } catch (err) {
      console.error('파일 파싱 오류:', err);
      setErrorMsg('파일 파싱에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
      setPhase('idle');
      setUploadedFile(null);
    }
  };

  // 컬럼/행 토글
  const toggleCol = (ci) => setSelectedCols(prev => { const n = new Set(prev); n.has(ci) ? n.delete(ci) : n.add(ci); return n; });
  const toggleRow = (ri) => setSelectedRows(prev => { const n = new Set(prev); n.has(ri) ? n.delete(ri) : n.add(ri); return n; });
  const toggleAllCols = () => {
    if (!allData[0]) return;
    setSelectedCols(prev => prev.size === allData[0].length ? new Set() : new Set(allData[0].map((_, i) => i)));
  };
  const toggleAllRows = () => {
    if (allData.length <= 1) return;
    setSelectedRows(prev => prev.size === allData.length - 1 ? new Set() : new Set(allData.slice(1).map((_, i) => i)));
  };

  // 암호화 실행
  const handleProcess = async () => {
    if (selectedCipher === 'custom' && !passphrase.trim()) { setErrorMsg('패스프레이즈를 입력해 주세요.'); return; }
    if (selectedCols.size === 0 || selectedRows.size === 0) { setErrorMsg('암호화할 필드와 레코드를 선택해 주세요.'); return; }

    setPhase('processing');
    setProgress(0);
    setErrorMsg('');

    try {
      let cryptoKey = null, exportedHex = null;
      if (selectedCipher === 'aes256') {
        cryptoKey = await generateAESKey(256);
        exportedHex = buf2hex(await crypto.subtle.exportKey('raw', cryptoKey));
      } else if (selectedCipher === 'aes128') {
        cryptoKey = await generateAESKey(128);
        exportedHex = buf2hex(await crypto.subtle.exportKey('raw', cryptoKey));
      } else if (selectedCipher === 'custom') {
        const salt = 'pms-' + Date.now();
        cryptoKey = await deriveKeyFromPass(passphrase, salt);
        exportedHex = 'PASSPHRASE (salt:' + salt + ')';
      }

      const header = allData[0] || [];
      const processed = [header];
      let totalTarget = 0;
      for (let ri = 0; ri < allData.length - 1; ri++) {
        if (selectedRows.has(ri)) totalTarget += selectedCols.size;
      }

      let done = 0;
      for (let ri = 0; ri < allData.length - 1; ri++) {
        const srcRow = allData[ri + 1];
        const newRow = [...srcRow];
        for (let ci = 0; ci < srcRow.length; ci++) {
          if (selectedRows.has(ri) && selectedCols.has(ci)) {
            setProcessingCell({ row: ri, col: ci });
            if (selectedCipher === 'mask') {
              newRow[ci] = maskCellValue(srcRow[ci]);
            } else {
              newRow[ci] = await encryptCellValue(srcRow[ci], cryptoKey);
            }
            done++;
            setProgress(Math.floor((done / totalTarget) * 100));
            await new Promise(r => setTimeout(r, 30));
          }
        }
        processed.push(newRow);
      }

      setProcessingCell(null);
      setResultData(processed);

      // CSV 형식으로 결과 파일 생성 (외부 라이브러리 없이)
      const csvString = arrayToCSV(processed);
      const bom = '\uFEFF'; // UTF-8 BOM (엑셀 한글 깨짐 방지)
      const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setResultBlobUrl(url);

      // 키 파일 생성 (AES 방식)
      if (exportedHex) {
        const keyText = [
          '=== PMS Center 보안 키 파일 ===',
          '생성: ' + new Date().toLocaleString('ko-KR'),
          '방식: ' + (CIPHER_OPTIONS.find(c => c.id === selectedCipher)?.label || ''),
          '원본: ' + (uploadedFile?.name || ''),
          '',
          '--- KEY ---',
          exportedHex,
          '',
          '주의: 이 키 없이 복호화 불가합니다.',
          'PMS Center CERT 보안팀'
        ].join('\n');
        setKeyBlobUrl(URL.createObjectURL(new Blob([keyText], { type: 'text/plain;charset=utf-8' })));
      }

      setStats({ rows: selectedRows.size, cells: done });
      setPhase('done');

      // 부모(App)에 결과 전달
      if (onProcessComplete) {
        onProcessComplete({
          filename: uploadedFile?.name || 'unknown',
          cipher: CIPHER_OPTIONS.find(c => c.id === selectedCipher)?.label || '',
          header: header,
          data: processed.slice(1),
          selectedCols: [...selectedCols],
          totalRows: selectedRows.size,
          totalCells: done,
          timestamp: new Date().toLocaleString('ko-KR'),
        });
      }
    } catch (err) {
      console.error('암호화 오류:', err);
      setPhase('selecting');
      setErrorMsg('처리 오류: ' + (err.message || '알 수 없는 오류'));
    }
  };

  // 보안 파기
  const handleShred = () => {
    if (!window.confirm('모든 파일과 데이터를 즉시 보안 파기합니까?\n복구 불가합니다.')) return;
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    if (keyBlobUrl) URL.revokeObjectURL(keyBlobUrl);
    setUploadedFile(null); setAllData([]); setResultData([]);
    setResultBlobUrl(null); setKeyBlobUrl(null);
    setSelectedCols(new Set()); setSelectedRows(new Set());
    setPassphrase(''); setProgress(0); setStats({ rows: 0, cells: 0 });
    setErrorMsg('');
    setPhase('shredded');
    if (fileRef.current) fileRef.current.value = '';
  };

  const cipher = CIPHER_OPTIONS.find(c => c.id === selectedCipher);
  const headers = allData[0] || [];
  const dataRows = allData.slice(1);

  // ========== 렌더링 ==========
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      {/* 타이틀 */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <FileLock size={36} className="text-blue-600" /> Security Vault
          </h2>
          <p className="text-slate-500 mt-2 font-medium">암호화 방식 선택 → 필드/레코드 지정 → 셀별 처리 → 다운로드 & 파기</p>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Web Crypto API
        </span>
      </div>

      {/* 에러 메시지 */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
          <p className="text-rose-700 text-sm font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg('')} className="ml-auto text-rose-400 hover:text-rose-600"><X size={16} /></button>
        </div>
      )}

      {/* 파기 완료 화면 */}
      {phase === 'shredded' && (
        <div className="bg-slate-900 text-white rounded-[3rem] p-20 text-center border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
          <ShieldCheck size={48} className="text-rose-400 mx-auto mb-6" />
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-3">Shredded & Cleared</h3>
          <p className="text-slate-500 font-medium mb-10">모든 파일 및 키 데이터가 보안 파기 완료되었습니다.</p>
          <button onClick={() => setPhase('idle')} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition uppercase italic">새 작업 시작</button>
        </div>
      )}

      {phase !== 'shredded' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* 좌측: 암호화 방식 선택 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 mb-5 uppercase italic text-xs tracking-widest flex items-center gap-2">
                <Key size={14} className="text-blue-500" /> Cipher Protocol
              </h3>
              <div className="space-y-2">
                {CIPHER_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setSelectedCipher(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedCipher === opt.id ? SELECTED_COLORS[opt.level] : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-black text-sm uppercase italic ${selectedCipher === opt.id ? 'text-slate-900' : 'text-slate-500'}`}>{opt.label}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${LEVEL_COLORS[opt.level]}`}>{opt.level}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {selectedCipher === 'custom' && (
                <div className="mt-4 animate-in slide-in-from-top-3 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">패스프레이즈</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} placeholder="최소 8자 이상..." value={passphrase} onChange={e => setPassphrase(e.target.value)}
                      className="w-full px-5 py-3 pr-10 bg-slate-50 border border-indigo-200 rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-400 transition" />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
              <h4 className="text-amber-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-3"><AlertTriangle size={12} /> 주의사항</h4>
              <ul className="text-amber-600 text-[11px] font-medium space-y-1.5 leading-relaxed">
                <li>- AES 방식: 키 파일 분실 시 복호화 영구 불가</li>
                <li>- 마스킹: 비가역 처리, 원본 복구 불가</li>
                <li>- 처리 완료 후 반드시 파기 버튼 실행</li>
              </ul>
            </div>
          </div>

          {/* 우측: 업로드 → 선택 → 처리 → 결과 */}
          <div className="xl:col-span-3 space-y-6">
            {/* 업로드 영역 */}
            {phase === 'idle' && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`bg-white rounded-[3rem] border-2 border-dashed p-16 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'} shadow-sm`}>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.tsv,.txt" className="hidden"
                  onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }} />
                <Upload size={36} className="mx-auto mb-4 text-blue-400" />
                <h3 className="font-black text-slate-700 text-xl mb-2 italic uppercase">엑셀 파일 업로드</h3>
                <p className="text-slate-400 text-sm font-medium">.xlsx, .xls, .csv 드래그 또는 클릭</p>
              </div>
            )}

            {/* 로딩 중 */}
            {phase === 'loading' && (
              <div className="bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-spin">
                  <RefreshCw size={28} className="text-blue-600" />
                </div>
                <h3 className="font-black text-slate-700 text-lg mb-2 italic uppercase">파일 분석 중...</h3>
                <p className="text-slate-400 text-sm font-medium">{uploadedFile?.name} 데이터를 구조 분석하고 있습니다.</p>
              </div>
            )}

            {/* 필드/레코드 선택 + 데이터 테이블 */}
            {(phase === 'selecting' || phase === 'processing') && allData.length > 1 && (
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-black text-slate-800 text-base uppercase italic tracking-tight">{uploadedFile?.name}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {headers.length} 필드 · {dataRows.length} 레코드 · 선택: {selectedCols.size}열 × {selectedRows.size}행
                    </p>
                  </div>
                  {phase === 'selecting' && (
                    <button onClick={() => { setUploadedFile(null); setAllData([]); setPhase('idle'); }} className="text-slate-300 hover:text-rose-400 transition p-2"><X size={20} /></button>
                  )}
                </div>

                {/* 필드 선택 바 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={toggleAllCols} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                      {selectedCols.size === headers.length ? '전체 해제' : '전체 선택'}
                    </button>
                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">· 암호화할 필드를 선택하세요</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {headers.map((h, ci) => (
                      <button key={ci} onClick={() => phase === 'selecting' && toggleCol(ci)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border ${selectedCols.has(ci) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-300'}`}>
                        {selectedCols.has(ci) && <Check size={12} className="inline mr-1" />}
                        {h || ('Col ' + (ci + 1))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 데이터 테이블 */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-3 border-b border-slate-100 w-10">
                          <button onClick={toggleAllRows} className="text-slate-400 hover:text-blue-600 transition">
                            {selectedRows.size === dataRows.length ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </th>
                        {headers.map((h, ci) => (
                          <th key={ci} className={`py-3 px-4 font-black uppercase tracking-wider border-b border-slate-100 whitespace-nowrap transition-colors ${selectedCols.has(ci) ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}>
                            {h || ('Col ' + (ci + 1))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dataRows.slice(0, 50).map((row, ri) => (
                        <tr key={ri} className={`transition-all ${selectedRows.has(ri) ? 'bg-white' : 'bg-slate-50/30 opacity-50'}`}>
                          <td className="py-3 px-3">
                            <button onClick={() => phase === 'selecting' && toggleRow(ri)} className={`transition ${selectedRows.has(ri) ? 'text-blue-600' : 'text-slate-300'}`}>
                              {selectedRows.has(ri) ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </td>
                          {row.map((cell, ci) => {
                            const isTarget = selectedCols.has(ci) && selectedRows.has(ri);
                            const isActive = processingCell?.row === ri && processingCell?.col === ci;
                            return (
                              <td key={ci} className={`py-3 px-4 font-medium whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis transition-all duration-300
                                ${isActive ? 'bg-blue-600 text-white font-black animate-pulse scale-105 rounded-lg shadow-lg' : ''}
                                ${isTarget && !isActive && phase === 'selecting' ? 'bg-blue-50/60 text-blue-800' : ''}
                                ${!isTarget ? 'text-slate-400' : 'text-slate-700'}
                              `}>{cell}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dataRows.length > 50 && (
                    <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-100 text-center">
                      ... 외 {dataRows.length - 50}행 (총 {dataRows.length}행 처리됩니다)
                    </div>
                  )}
                </div>

                {/* 진행률 */}
                {phase === 'processing' && (
                  <div className="mt-6 space-y-3 animate-in fade-in duration-300">
                    <div className="flex justify-between text-xs font-black uppercase italic text-slate-500">
                      <span>{cipher?.label} 적용 중...</span>
                      <span className="text-blue-600 tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-200 shadow-lg shadow-blue-200" style={{ width: progress + '%' }}></div>
                    </div>
                  </div>
                )}

                {/* 실행 버튼 */}
                {phase === 'selecting' && (
                  <button onClick={handleProcess}
                    className="w-full mt-6 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-2xl shadow-blue-200 uppercase italic tracking-tighter flex items-center justify-center gap-3">
                    <Lock size={20} /> {selectedCols.size}필드 × {selectedRows.size}행 보안 처리 실행
                  </button>
                )}
              </div>
            )}

            {/* 완료 패널 */}
            {phase === 'done' && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <CheckCircle size={28} className="text-emerald-500" />
                  <div>
                    <h3 className="font-black text-slate-800 text-xl italic uppercase">Processing Complete</h3>
                    <p className="text-slate-400 text-sm font-medium">{stats.rows}행 {stats.cells}셀 처리 · {cipher?.label}</p>
                  </div>
                </div>

                {resultData.length > 1 && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 mb-8 max-h-[200px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-emerald-50 sticky top-0">
                        <tr>
                          {resultData[0].map((h, ci) => (
                            <th key={ci} className="py-2 px-3 font-black text-emerald-700 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap">{h || ('Col ' + (ci + 1))}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {resultData.slice(1, 6).map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="py-2 px-3 text-slate-600 font-medium whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  <a href={resultBlobUrl} download={'SECURED_' + (uploadedFile?.name?.replace(/\.\w+$/, '') || 'data') + '.csv'}
                    className="flex items-center justify-between w-full px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 group">
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <span className="uppercase italic text-sm">암호화 파일 다운로드 (.csv)</span>
                    </div>
                    <ChevronDown size={18} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                  </a>
                  {keyBlobUrl && (
                    <a href={keyBlobUrl} download={'KEY_' + (uploadedFile?.name || 'file') + '.txt'}
                      className="flex items-center justify-between w-full px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black hover:bg-indigo-100 transition border border-indigo-100 group">
                      <div className="flex items-center gap-3"><Key size={18} /><span className="uppercase italic text-sm">KEY 파일 다운로드</span></div>
                      <ChevronDown size={18} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-1"><AlertTriangle size={10} /> 다운로드 후 반드시 파기하십시오</p>
                  <button onClick={handleShred}
                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 active:scale-[0.98] transition-all shadow-2xl shadow-rose-100 uppercase italic tracking-tighter flex items-center justify-center gap-3 text-lg">
                    <Trash2 size={20} /> 보안 파기 (Secure Shred)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
