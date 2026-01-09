import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, TrendingUp, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="flex h-16 items-center px-4 lg:px-6 border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-lg">
          <div className="p-2 rounded-lg bg-primary text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-slate-900 tracking-tight">BizGuard <span className="text-secondary font-medium ml-1">ERP</span></span>
        </div>
        <nav className="ml-auto flex gap-6 sm:gap-10">
          <Link className="text-sm font-bold text-slate-700 hover:text-primary transition-colors" href="/login">
            대시보드
          </Link>
          <Link className="text-sm font-bold text-slate-700 hover:text-primary transition-colors" href="/demo">
            기능 소개
          </Link>
          <Link className="text-sm font-bold text-slate-700 hover:text-primary transition-colors" href="/support">
            고객센터
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section: ECOUNT Style (Text Left, Image Right) */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in slide-in-from-left duration-700 text-left">
                <div className="inline-block px-3 py-1 rounded-sm bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  Corporate Security & Finance
                </div>
                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                    사업의 시작부터 끝까지 <br />
                    <span className="text-primary underline decoration-4 decoration-primary/20 underline-offset-8">완벽한 보안 & 재무 ERP</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                    어렵고 복잡한 재무 관리와 개인정보 보호,<br />
                    대한민국 비즈니스 표준 <strong>BizGuard</strong>와 함께라면 간편해집니다.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/login">
                    <Button className="h-14 px-10 text-lg font-bold shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all">
                      지금 바로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline" className="h-14 px-10 text-lg font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-700">
                      체험 ID 신청
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative animate-in slide-in-from-right zoom-in duration-1000">
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-secondary/20 to-cyan-400/20 rounded-full blur-[100px] opacity-60 animate-pulse"></div>
                <div className="relative bg-white/40 backdrop-blur-xl p-3 rounded-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img src="/erp_premium_3d_isometric_dashboard.png" alt="BizGuard Premium Dashboard" className="rounded-xl w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]" />
                  <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-lg border border-white/50 shadow-sm animate-bounce">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid: Ultra Premium */}
        <section className="w-full py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                비즈니스가 필요한 모든 기능을 하나로
              </h2>
              <p className="text-xl text-slate-500 font-medium">관리 효율은 높이고, 보안 리스크는 0으로 만듭니다.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="bg-white p-12 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 w-fit rounded-xl bg-primary text-white mb-8 group-hover:rotate-6 transition-transform shadow-xl shadow-primary/20">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">재무 관리 표준</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  수입/지출 내역 자동 분석 및 엑셀 연동을 통해 수작업 없는 완벽한 장부 관리를 실현합니다.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-12 rounded-2xl border border-slate-100 hover:border-secondary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 w-fit rounded-xl bg-secondary text-white mb-8 group-hover:rotate-6 transition-transform shadow-xl shadow-secondary/20">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">개인정보 통합 보호</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  ISMS/ISO 규격에 맞춘 개인정보 보호 체계 구축부터 정책 자동 생성까지 원스톱으로 제공합니다.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-12 rounded-2xl border border-slate-100 hover:border-slate-900/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-4 w-fit rounded-xl bg-slate-900 text-white mb-8 group-hover:rotate-6 transition-transform shadow-xl shadow-slate-900/10">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">강력한 시큐어 금고</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  어떠한 침입도 허용하지 않는 군사 등급 암호화 금고로 기업의 핵심 기술 문서를 안전하게 지킵니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section: ERP Style */}
        <section className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                투명한 정찰제 요금 시스템
              </h2>
              <p className="text-lg text-slate-500 font-medium">합리적인 비용으로 대기업 수준의 관리 인프라를 구축하세요.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-0 max-w-6xl mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-10 bg-white border-r border-slate-200 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">프리 에디션</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-slate-900">0원</span>
                  <span className="text-slate-400 font-bold ml-1">/월</span>
                </div>
                <ul className="space-y-4 flex-1 mb-10 text-slate-600 font-bold">
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                    <span>기본 재무 장부 50건</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                    <span>정책 생성기 (일반용)</span>
                  </li>
                </ul>
                <Button variant="outline" className="h-12 border-2 text-bold">도입 상담하기</Button>
              </div>

              <div className="p-10 bg-slate-50 border-r border-slate-200 flex flex-col relative scale-105 shadow-2xl z-10">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                <div className="absolute top-6 right-6 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-sm">
                  Recommended
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">비즈니스 프로</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-primary">월 4만원</span>
                </div>
                <ul className="space-y-4 flex-1 mb-10 text-slate-900 font-bold">
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>모든 재무 관리 기능 무제한</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>AI 매출 예측 시뮬레이터</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>통합 보안 금고 (10GB)</span>
                  </li>
                </ul>
                <Button className="h-12 text-lg font-black shadow-lg shadow-primary/20">지금 가입하기</Button>
              </div>

              <div className="p-10 bg-white flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">프리미엄 그룹</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-slate-900">별도 문의</span>
                </div>
                <ul className="space-y-4 flex-1 mb-10 text-slate-600 font-bold">
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                    <span>계열사 통합 관리</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                    <span>전담 기술 기술팀 배정</span>
                  </li>
                </ul>
                <Button variant="outline" className="h-12 border-2 text-bold">엔터프라이즈 맞춤 상담</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-20">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-4 gap-12 mb-16 border-b border-white/5 pb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3 font-bold text-white">
                <div className="p-1.5 rounded bg-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xl">BizGuard</span>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                비즈니스의 가치를 보호하고 성장을 가속화하는<br />
                대한민국 No.1 통합 보안 재무 솔루션.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:col-span-3">
              <div className="grid sm:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-white font-bold mb-6">주요 기능</h4>
                  <ul className="space-y-3 text-sm font-medium">
                    <li><Link href="#" className="hover:text-primary transition">재무 관리</Link></li>
                    <li><Link href="#" className="hover:text-primary transition">개인정보 보호</Link></li>
                    <li><Link href="#" className="hover:text-primary transition">기술적 보안</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-6">고객 지원</h4>
                  <ul className="space-y-3 text-sm font-medium">
                    <li><Link href="#" className="hover:text-primary transition">요금제 안내</Link></li>
                    <li><Link href="#" className="hover:text-primary transition">도입 상담</Link></li>
                    <li><Link href="#" className="hover:text-primary transition">FAQ</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-6">정책/약관</h4>
                  <ul className="space-y-3 text-sm font-medium">
                    <li><Link href="/search/google" className="hover:text-primary transition">이용약관</Link></li>
                    <li><Link href="/privacy-policy" className="hover:text-primary transition">개인정보처리방침</Link></li>
                    <li><Link href="/search/ai" className="hover:text-primary transition">CSR 리포트</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs font-medium space-y-1">
              <p>© 2024 BizGuard Corporation. All rights reserved.</p>
              <p className="text-slate-500">본사: 서울특별시 강남구 테헤란로 (주)비즈가드 | 대표이사: 김종환 | 사업자등록번호: 214-88-00000</p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition text-white">
                <span className="sr-only">Social</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
