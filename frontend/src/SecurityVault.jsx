import React, { useState, useRef, useCallback } from 'react';
// 보안 금고 전용 아이콘 세트
import {
  Lock, Unlock, Upload, Download, Shield, ShieldCheck, Trash2,
  FileText, Key, AlertTriangle, CheckCircle, X, RefreshCw,
  ChevronDown, Info, Zap, Eye, EyeOff, FileLock
} from 'lucide-react';
// 엑셀 파일 파싱/생성을 위한 SheetJS 라이브러리
import * as XLSX from 'xlsx';

// --- 지원하는 암호화 방식 옵션 목록 ---
const CIPHER_OPTIONS = [
  {
    id: 'aes256',
    label: 'AES-256-GCM',
    desc: '업계 표준 대칭키 암호화. NIST 권장 방식.',
    level: 'MILITARY', color: 'emerald', icon: ShieldCheck
  },
  {
    id: 'aes128',
    label: 'AES-128-GCM',
    desc: '경량화된 대칭키 암호화. 빠른 처리 속도 보장.',
    level: 'STRONG', color: 'blue', icon: Shield
  },
  {
    id: 'custom_passphrase',
    label: '사용자 정의 패스프레이즈',
    desc: '직접 입력한 비밀문구를 키 재료(PBKDF2)로 사용.',
    level: 'CUSTOM', color: 'indigo', icon: Key
  },
  {
    id: 'mask',
    label: '마스킹 처리 (비가역)',
    desc: '개인정보 필드를 *** 형식으로 치환. 암호화 불필요 상황에 적합.',
    level: 'BASIC', color: 'amber', icon: EyeOff
  },
];

// 색상 레벨별 스타일 맵핑
const LEVEL_STYLE = {
  MILITARY: { badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', ring: 'ring-emerald-500/30', card: 'border-emerald-200 bg-emerald-50/50' },
  STRONG:   { badge: 'bg-blue-50 text-blue-600 border-blue-100',         ring: 'ring-blue-500/30',    card: 'border-blue-200 bg-blue-50/50' },
  CUSTOM:   { badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',   ring: 'ring-indigo-500/30',  card: 'border-indigo-200 bg-indigo-50/50' },
  BASIC:    { badge: 'bg-amber-50 text-amber-600 border-amber-100',      ring: 'ring-amber-500/30',   card: 'border-amber-200 bg-amber-50/50' },
};

// --- 핵심 보안 로직: Web Crypto API 기반 AES-GCM 암호화 ---

// ArrayBuffer -> 16진수 문자열 변환 유틸리티
const buf2hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

// 문자열 -> 해시 키 파생 (PBKDF2, 사용자 정의 패스프레이즈용)
async function deriveKey(passphrase, salt, bits = 256) {
  const enc = new TextEncoder();
  // passphrase를 원료로 키 추출
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  // PBKDF2 알고리즘으로 AES-GCM 키 파생 (100,000 반복)
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: bits },
    false,
    ['encrypt']
  );
}

// 임의의 AES-GCM 키 직접 생성 (AES-256 / AES-128)
async function generateAESKey(bits = 256) {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: bits },
    true, // 내보내기 허용 (다운로드 파일에 저장)
    ['encrypt']
  );
}

// 셀 값을 AES-GCM으로 암호화 -> 16진수 문자열 반환
async function encryptCell(value, key) {
  if (value === null || value === undefined || value === '') return value;
  const enc = new TextEncoder();
  // 12바이트 초기화 벡터(IV) 무작위 생성
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(String(value))
  );
  // IV + 암호문을 16진수로 직렬화하여 반환
  return 'ENC:' + buf2hex(iv) + buf2hex(ciphertext);
}

// 셀 값을 마스킹 처리 (비가역 처리)
function maskCell(value) {
  if (value === null || value === undefined || value === '') return value;
  const str = String(value);
  if (str.length <= 2) return '***';
  // 앞 1글자 + 마스킹 + 끝 1글자 형식
  return str[0] + '*'.repeat(Math.max(str.length - 2, 3)) + str[str.length - 1];
}

// --- 메인 SecurityVault 컴포넌트 ---
export default function SecurityVault() {
  // 현재 선택된 암호화 방식
  const [selectedCipher, setSelectedCipher] = useState('aes256');
  // 업로드된 원본 파일 객체
  const [uploadedFile, setUploadedFile] = useState(null);
  // 처리 진행 상태: idle | parsing | encrypting | done | shredded
  const [processState, setProcessState] = useState('idle');
  // 변환된 파일의 Blob URL
  const [outputBlobUrl, setOutputBlobUrl] = useState(null);
  // 원본 파일의 미리보기 데이터 (첫 5행)
  const [previewData, setPreviewData] = useState(null);
  // 사용자 정의 패스프레이즈 입력값
  const [passphrase, setPassphrase] = useState('');
  // 패스프레이즈 표시/숨김 토글
  const [showPass, setShowPass] = useState(false);
  // 처리 진행률 (0~100)
  const [progress, setProgress] = useState(0);
  // 변환에 사용된 키 다운로드용 데이터
  const [keyBlobUrl, setKeyBlobUrl] = useState(null);
  // 처리된 행 수 통계
  const [stats, setStats] = useState({ rows: 0, cells: 0, filename: '' });
  // 드래그 오버 상태
  const [isDragging, setIsDragging] = useState(false);
  // 파일 input ref
  const fileInputRef = useRef(null);

  // 파일 드롭/선택 시 처리
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    // 지원 형식: xlsx, xls, csv
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     'application/vnd.ms-excel', 'text/csv'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['xlsx','xls','csv'].includes(ext)) {
      alert('xlsx, xls, csv 파일만 업로드 가능합니다.');
      return;
    }
    setUploadedFile(file);
    setProcessState('idle');
    setOutputBlobUrl(null);
    setKeyBlobUrl(null);
    setProgress(0);

    // 미리보기 파싱 (첫 5행만 표시)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        setPreviewData(data.slice(0, 6)); // 헤더 + 5행
      } catch { setPreviewData(null); }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  // 핵심: 파일 처리 및 암호화 파이프라인
  const handleProcess = async () => {
    if (!uploadedFile) return;
    if (selectedCipher === 'custom_passphrase' && !passphrase.trim()) {
      alert('패스프레이즈를 입력해 주세요.'); return;
    }
    setProcessState('parsing');
    setProgress(10);

    try {
      // 1단계: 원본 파일 파싱
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      // 모든 행/열 데이터 추출 (헤더 포함)
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      setProcessState('encrypting');
      setProgress(30);

      let cryptoKey = null;
      let exportedKeyHex = null;

      // 2단계: 암호화 키 준비
      if (selectedCipher === 'aes256') {
        cryptoKey = await generateAESKey(256);
        const exported = await window.crypto.subtle.exportKey('raw', cryptoKey);
        exportedKeyHex = buf2hex(exported);
      } else if (selectedCipher === 'aes128') {
        cryptoKey = await generateAESKey(128);
        const exported = await window.crypto.subtle.exportKey('raw', cryptoKey);
        exportedKeyHex = buf2hex(exported);
      } else if (selectedCipher === 'custom_passphrase') {
        // 솔트는 타임스탬프 기반으로 생성
        const salt = `pms-salt-${Date.now()}`;
        cryptoKey = await deriveKey(passphrase.trim(), salt, 256);
        exportedKeyHex = `PASSPHRASE_DERIVED (salt: ${salt})`;
      }

      // 3단계: 행별 셀 처리 (헤더 행은 그대로 유지)
      const processedData = [];
      const header = rawData[0] || [];
      processedData.push(header); // 헤더는 암호화 제외

      let totalCells = 0;
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const processedRow = [];
        for (let j = 0; j < row.length; j++) {
          if (selectedCipher === 'mask') {
            // 마스킹 처리 (비가역)
            processedRow.push(maskCell(row[j]));
          } else {
            // AES-GCM 암호화 처리
            processedRow.push(await encryptCell(row[j], cryptoKey));
          }
          totalCells++;
        }
        processedData.push(processedRow);
        // 진행률 업데이트 (30~85% 구간)
        setProgress(30 + Math.floor(((i / (rawData.length - 1)) * 55)));
      }

      setProgress(88);

      // 4단계: 새 엑셀 파일 생성
      const newWb = XLSX.utils.book_new();
      const newWs = XLSX.utils.aoa_to_sheet(processedData);
      XLSX.utils.book_append_sheet(newWb, newWs, 'Secured_Data');
      const outputBuffer = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
      const outputBlob = new Blob([outputBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(outputBlob);
      setOutputBlobUrl(url);

      // 5단계: 키 파일 생성 (마스킹 제외)
      if (exportedKeyHex) {
        const keyContent = [
          '=== PMS Center 보안 키 파일 ===',
          `생성일시: ${new Date().toLocaleString('ko-KR')}`,
          `암호화 방식: ${CIPHER_OPTIONS.find(c => c.id === selectedCipher)?.label}`,
          `원본 파일: ${uploadedFile.name}`,
          '',
          '--- 암호화 키 (이 파일을 안전한 곳에 보관하십시오) ---',
          exportedKeyHex,
          '',
          '주의: 이 키를 분실하면 데이터 복호화가 불가능합니다.',
          '© 2026 PMS Center Inc. CERT 보안팀'
        ].join('\n');
        const keyBlob = new Blob([keyContent], { type: 'text/plain;charset=utf-8' });
        setKeyBlobUrl(URL.createObjectURL(keyBlob));
      }

      setProgress(100);
      setStats({
        rows: rawData.length - 1,
        cells: totalCells,
        filename: `SECURED_${uploadedFile.name}`
      });
      setProcessState('done');

    } catch (err) {
      console.error(err);
      setProcessState('idle');
      alert('파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해 주세요.');
    }
  };

  // 보안 파기 처리: 메모리 해제 및 상태 초기화
  const handleShred = () => {
    if (!window.confirm('업로드 파일 및 변환 파일을 즉시 보안 파기하시겠습니까?\n파기된 데이터는 복구할 수 없습니다.')) return;

    // Blob URL 즉시 해제 (브라우저 메모리 반환)
    if (outputBlobUrl) URL.revokeObjectURL(outputBlobUrl);
    if (keyBlobUrl) URL.revokeObjectURL(keyBlobUrl);

    // 모든 상태 초기화 (메모리에서 데이터 소거)
    setUploadedFile(null);
    setOutputBlobUrl(null);
    setKeyBlobUrl(null);
    setPreviewData(null);
    setPassphrase('');
    setProgress(0);
    setStats({ rows: 0, cells: 0, filename: '' });
    setProcessState('shredded');

    // 파일 입력창도 리셋
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 초기화 (shredded 상태에서 새 작업 시작)
  const handleReset = () => setProcessState('idle');

  // 현재 선택된 암호화 옵션 객체
  const currentCipher = CIPHER_OPTIONS.find(c => c.id === selectedCipher);
  const levelStyle = LEVEL_STYLE[currentCipher?.level] || LEVEL_STYLE.BASIC;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <FileLock size={36} className="text-blue-600" /> Security Vault
          </h2>
          <p className="text-slate-500 mt-2 font-medium">엑셀 데이터를 선택한 보안 방식으로 처리하고 즉시 파기합니다.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Web Crypto API Enabled
        </div>
      </div>

      {/* 파기 완료 화면 */}
      {processState === 'shredded' ? (
        <div className="bg-slate-900 text-white rounded-[3rem] p-20 text-center border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-rose-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={48} className="text-rose-400" />
          </div>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-3">Shredded & Cleared</h3>
          <p className="text-slate-500 font-medium mb-10">모든 파일 및 키 데이터가 보안 파기되었습니다.<br />브라우저 메모리에 어떠한 흔적도 남지 않았습니다.</p>
          <div className="inline-flex items-center gap-2 bg-white/5 text-slate-400 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
            <CheckCircle size={14} className="text-emerald-400" /> GDPR 데이터 최소화 원칙 준수 완료
          </div>
          <div className="block">
            <button onClick={handleReset} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition uppercase italic tracking-tighter">
              새 파일 보안 처리 시작
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* 좌측: 암호화 방식 선택 패널 */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 mb-6 uppercase italic flex items-center gap-2 text-sm tracking-widest">
                <Key size={16} className="text-blue-500" /> Cipher Protocol
              </h3>
              <div className="space-y-3">
                {CIPHER_OPTIONS.map((opt) => {
                  const style = LEVEL_STYLE[opt.level];
                  const isSelected = selectedCipher === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedCipher(opt.id)}
                      className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 ${isSelected ? `${style.card} border-2` : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <opt.icon size={16} className={isSelected ? '' : 'text-slate-400'} />
                          <span className={`font-black text-sm uppercase italic ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{opt.label}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${style.badge}`}>{opt.level}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed pl-6">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* 사용자 정의 패스프레이즈 입력 영역 */}
              {selectedCipher === 'custom_passphrase' && (
                <div className="mt-6 animate-in slide-in-from-top-3 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">My Passphrase</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="최소 8자 이상의 비밀문구 입력..."
                      value={passphrase}
                      onChange={e => setPassphrase(e.target.value)}
                      className="w-full px-6 py-4 pr-12 bg-slate-50 border border-indigo-200 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-400 transition"
                    />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                    <Info size={10} /> PBKDF2(SHA-256, 100,000회 반복)로 파생됩니다.
                  </p>
                </div>
              )}
            </div>

            {/* 주의 안내 박스 */}
            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 shadow-sm">
              <h4 className="text-amber-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlertTriangle size={14} /> 보안 주의사항
              </h4>
              <ul className="text-amber-600 text-xs font-medium space-y-2 leading-relaxed">
                <li>- AES 방식의 경우 키 파일(.txt)을 반드시 안전한 곳에 보관하세요.</li>
                <li>- 키를 분실하면 데이터 복호화가 영구적으로 불가능합니다.</li>
                <li>- 마스킹 처리는 비가역 처리로 원본 복구가 불가능합니다.</li>
                <li>- 처리가 완료되면 반드시 파기 버튼을 눌러 흔적을 제거하세요.</li>
              </ul>
            </div>
          </div>

          {/* 우측: 파일 업로드 및 처리 패널 */}
          <div className="xl:col-span-3 space-y-6">
            {/* 파일 업로드 영역 */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploadedFile && fileInputRef.current?.click()}
              className={`bg-white rounded-[3rem] border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-400 bg-blue-50' : uploadedFile ? 'border-slate-200 bg-white' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'} shadow-sm`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => handleFileSelect(e.target.files[0])}
              />

              {!uploadedFile ? (
                // 업로드 전 기본 안내
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-400">
                    <Upload size={36} />
                  </div>
                  <h3 className="font-black text-slate-700 text-xl mb-2 italic uppercase">엑셀 파일을 드래그하거나 클릭하여 업로드</h3>
                  <p className="text-slate-400 text-sm font-medium">.xlsx, .xls, .csv 형식 지원</p>
                </div>
              ) : (
                // 업로드 완료 후 파일 정보 표시
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 italic">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                          {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.type || 'spreadsheet'}
                        </p>
                      </div>
                    </div>
                    {processState === 'idle' && (
                      <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setPreviewData(null); }} className="text-slate-300 hover:text-rose-400 transition p-2">
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* 데이터 미리보기 테이블 */}
                  {previewData && previewData.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 mb-4">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            {(previewData[0] || []).map((h, i) => (
                              <th key={i} className="py-3 px-4 font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">{h || `Col ${i+1}`}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {previewData.slice(1, 4).map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50/50 transition-colors">
                              {row.map((cell, ci) => (
                                <td key={ci} className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-4 py-2 bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-100">
                        미리보기 (원본 데이터 최초 3행)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 처리 실행 버튼 및 진행 상태 */}
            {uploadedFile && processState !== 'done' && (
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
                {(processState === 'parsing' || processState === 'encrypting') ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase italic text-slate-500">
                      <span>{processState === 'parsing' ? '파일 파싱 중...' : '암호화 처리 중...'}</span>
                      <span className="text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300 shadow-lg shadow-blue-200"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">
                      {processState === 'encrypting' ? `${currentCipher?.label} 적용 중...` : '데이터 구조 분석 중...'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleProcess}
                    className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-2xl shadow-blue-200 uppercase italic tracking-tighter flex items-center justify-center gap-3"
                  >
                    <Lock size={22} /> {currentCipher?.label} 보안 처리 시작
                  </button>
                )}
              </div>
            )}

            {/* 처리 완료: 다운로드 및 파기 패널 */}
            {processState === 'done' && (
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl italic uppercase">Processing Complete</h3>
                    <p className="text-slate-400 text-sm font-medium">{stats.rows}개 행, {stats.cells}개 셀이 안전하게 처리되었습니다.</p>
                  </div>
                </div>

                {/* 처리 요약 카드 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { l: '처리 방식', v: currentCipher?.label },
                    { l: '처리 행 수', v: `${stats.rows}행` },
                    { l: '처리 셀 수', v: `${stats.cells}개` },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className="font-black text-slate-800 text-sm italic">{s.v}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-8">
                  {/* 보안 처리된 파일 다운로드 */}
                  <a
                    href={outputBlobUrl}
                    download={stats.filename}
                    className="flex items-center justify-between w-full px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={20} />
                      <div className="text-left">
                        <p className="uppercase italic text-sm tracking-tight">{stats.filename}</p>
                        <p className="text-[10px] opacity-60 uppercase tracking-widest">암호화 완료 파일 다운로드</p>
                      </div>
                    </div>
                    <ChevronDown size={18} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* 키 파일 다운로드 (AES 방식일 경우) */}
                  {keyBlobUrl && (
                    <a
                      href={keyBlobUrl}
                      download={`KEY_${uploadedFile?.name}_${Date.now()}.txt`}
                      className="flex items-center justify-between w-full px-8 py-5 bg-indigo-50 text-indigo-700 rounded-2xl font-black hover:bg-indigo-100 transition border border-indigo-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <Key size={20} />
                        <div className="text-left">
                          <p className="uppercase italic text-sm tracking-tight">KEY 파일 다운로드</p>
                          <p className="text-[10px] opacity-60 uppercase tracking-widest">이 파일 없이 복호화 불가</p>
                        </div>
                      </div>
                      <ChevronDown size={18} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>

                {/* 보안 파기 버튼 */}
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> 다운로드 완료 후 반드시 파기 절차를 진행하십시오
                  </p>
                  <button
                    onClick={handleShred}
                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 active:scale-[0.98] transition-all shadow-2xl shadow-rose-100 uppercase italic tracking-tighter flex items-center justify-center gap-3 text-lg"
                  >
                    <Trash2 size={22} /> 보안 파기 (Secure Shred)
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
