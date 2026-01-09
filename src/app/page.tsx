import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-slate-50">
      <header className="flex h-16 items-center px-4 lg:px-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-slate-900">BizGuard</span>
        </div>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/login">
            대시보드
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#">
            기능 소개
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#">
            요금제
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-28 lg:py-36 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-sm font-semibold text-blue-700">Bright & Safe 플랫폼 재오픈</span>
              </div>
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                  당신의 사업을 <br/>
                  <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">안전하고 똑똑하게</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                  복잡한 재무 관리와 까다로운 개인정보 보호를 <br className="hidden md:block" />
                  <strong>BizGuard</strong> 하나로 완벽하게 해결하세요.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                    무료로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="h-12 px-8 text-base font-semibold border-slate-300 hover:bg-slate-50">
                  자세히 알아보기
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Service Summary Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-white border-b border-slate-100">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                  완벽한 사업 관리의 핵심
                </h2>
                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  <strong>BizGuard</strong>는 소규모 비즈니스와 프리랜서를 위해 설계되었습니다.<br />
                  재무 관리부터 보안 컴플라이언스까지 모든 것을 한곳에서 해결하세요.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-25 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-600 text-white flex-shrink-0">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">💰 재무 관리</h3>
                      <ul className="space-y-2 text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span>간편한 수입/지출 장부 작성 및 분석</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span>엑셀 자동 인식 및 실시간 처리</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span>AI 기반의 다음 달 매출 예측</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-25 p-8 rounded-2xl border border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-600 text-white flex-shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">🔒 보안 & 컴플라이언스</h3>
                      <ul className="space-y-2 text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>군사 등급(AES-256) 암호화 금고</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>운영자도 접근 불가능한 데이터 격리</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>자동 정책 생성 & 법률 가이드</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-b from-slate-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
                왜 BizGuard를 선택해야 할까?
              </h2>
              <p className="text-lg text-slate-600 font-medium">세 가지 핵심 우점으로 당신의 사업을 보호합니다</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-xl transition-all group">
                <div className="p-3 w-fit rounded-xl bg-blue-600 text-white mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">스마트한 재무 관리</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  자동 장부 정리와 AI 기반 예측으로 당신의 비즈니스 수익성을 한눈에 파악하세요.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-xl transition-all group">
                <div className="p-3 w-fit rounded-xl bg-emerald-600 text-white mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">확실한 개인정보 보호</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  금융권 수준의 암호화로 고객 정보와 중요 문서를 완벽하게 보호합니다.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-purple-300 hover:shadow-xl transition-all group">
                <div className="p-3 w-fit rounded-xl bg-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">쉬운 규정 준수</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  개인정보처리방침 생성부터 데이터 관리까지, 번거로운 규정을 한눈에 관리합니다.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-28 lg:py-36 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
                투명하고 합리적인 요금
              </h2>
              <p className="text-lg text-slate-600 font-medium">당신의 비즈니스 규모에 맞는 요금제를 선택하세요</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="flex flex-col p-8 bg-white rounded-2xl border-2 border-slate-200 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-2">스타터</h3>
                <p className="text-sm text-slate-500 mb-4">개인 및 소규모 사업용</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-blue-600">0원</span>
                  <span className="text-slate-500 font-medium">/월</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>기본 재무 장부</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>월별 통계</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>정책 생성기 (기본)</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-slate-300">시작하기</Button>
              </div>
              <div className="flex flex-col p-8 bg-gradient-to-br from-blue-50 to-blue-25 rounded-2xl border-2 border-blue-400 hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  인기⭐
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">프로</h3>
                <p className="text-sm text-slate-600 mb-4">성장하는 비즈니스용</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-blue-600">15,000원</span>
                  <span className="text-slate-500 font-medium">/월</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>고급 재무 분석</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>AI 매출 예측 (Pro)</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>암호화 금고 (1GB)</span>
                  </li>
                </ul>
                <Button className="w-full font-semibold shadow-lg">무료 체험 시작</Button>
              </div>
              <div className="flex flex-col p-8 bg-white rounded-2xl border-2 border-slate-200 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-2">엔터프라이즈</h3>
                <p className="text-sm text-slate-500 mb-4">전문 보안 관리용</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">50,000원</span>
                  <span className="text-slate-500 font-medium">/월</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span>다중 사용자 접근</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span>전담 법률 상담</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span>우선 지원</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-slate-300">문의하기</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 text-slate-100 py-12">
        <div className="container px-4 md:px-6 space-y-8">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-white mb-4">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <span>BizGuard</span>
              </div>
              <p className="text-sm text-slate-300">당신의 사업을 안전하고 똑똑하게 관리하세요.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">제품</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="#" className="hover:text-white transition">재무 관리</Link></li>
                <li><Link href="#" className="hover:text-white transition">보안 & 컴플라이언스</Link></li>
                <li><Link href="#" className="hover:text-white transition">요금제</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="#" className="hover:text-white transition">블로그</Link></li>
                <li><Link href="#" className="hover:text-white transition">문의하기</Link></li>
                <li><Link href="#" className="hover:text-white transition">채용</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">법규</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link href="#" className="hover:text-white transition">이용약관</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition">개인정보처리방침</Link></li>
                <li><Link href="#" className="hover:text-white transition">보안정책</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-sm text-slate-400 text-center">
              © 2024 BizGuard. All rights reserved. | CEO: 김종환
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
