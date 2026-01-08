import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6 border-b">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span>비즈가드 (BizGuard)</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            대시보드
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            기능 소개
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            요금제
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  개인 및 소상공인을 위한 <br /> 통합 경영 관리 & 보안 파트너
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">비즈가드(BizGuard)</span>와 함께라면 복잡한 장부 정리부터 까다로운 개인정보 보호까지 한 번에 해결됩니다.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button className="h-11 px-8">
                    지금 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="h-11 px-8">
                  더 알아보기
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Service Summary Section */}
        <section className="w-full py-12 md:py-24 bg-white dark:bg-black border-b">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                비즈가드는 어떤 서비스인가요?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong>비즈가드(BizGuard)</strong>는 소규모 비즈니스를 운영하는 사장님과 프리랜서분들을 위해 탄생했습니다.<br />
                매출/지출 관리와 같은 <strong>재무 업무</strong>부터, 중요 계약서 보관 및 개인정보 처리방침 생성과 같은 <strong>보안 업무</strong>까지.<br />
                이제 복잡한 도구 없이 비즈가드 하나로 안전하고 똑똑하게 관리하세요.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-left">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
                  <h3 className="flex items-center text-xl font-bold mb-3 text-blue-600">
                    <TrendingUp className="mr-2 h-5 w-5" /> 재무 관리 (Finance)
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>간편한 수입/지출 장부 작성</li>
                    <li>엑셀 파일 업로드 및 자동 분석</li>
                    <li>AI 기반의 다음 달 매출 예측 리포트</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
                  <h3 className="flex items-center text-xl font-bold mb-3 text-purple-600">
                    <ShieldCheck className="mr-2 h-5 w-5" /> 보안/프라이버시 (Security)
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>군사 등급(AES-256) 암호화 문서 금고</li>
                    <li>운영자도 볼 수 없는 완벽한 데이터 격리</li>
                    <li>개인정보 처리방침 자동 생성 및 가이드</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                  <TrendingUp className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold">스마트한 재무 관리</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  자동 장부 정리와 AI 기반 예측으로 비즈니스 수익성을 유지하세요.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                  <ShieldCheck className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">개인정보 지킴이</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  금융권 수준의 암호화와 규정 준수 도구로 민감한 데이터를 보호합니다.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-full">
                  <ArrowRight className="h-10 w-10 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold">간편한 규정 준수</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  개인정보처리방침을 생성하고 데이터 보호법에 대한 상담을 받으세요.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">투명하고 합리적인 요금제</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                <h3 className="text-lg font-bold">스타터 (Starter)</h3>
                <div className="mt-4 text-4xl font-bold">0원</div>
                <p className="text-sm text-gray-500">평생 무료</p>
                <ul className="mt-6 space-y-4 flex-1">
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 기본 장부</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 일별 통계</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 방침 생성기 (기본)</li>
                </ul>
                <Button className="mt-8">시작하기</Button>
              </div>
              <div className="flex flex-col p-6 bg-white dark:bg-gray-900 rounded-lg border border-purple-500 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1">인기</div>
                <h3 className="text-lg font-bold">프로 (Pro)</h3>
                <div className="mt-4 text-4xl font-bold">15,000원<span className="text-base font-normal text-gray-500">/월</span></div>
                <p className="text-sm text-gray-500">성장하는 비즈니스용</p>
                <ul className="mt-6 space-y-4 flex-1">
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 고급 분석 기능</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> AI 매출 예측</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 암호화 금고 (1GB)</li>
                </ul>
                <Button className="mt-8" variant="default">무료 체험 시작</Button>
              </div>
              <div className="flex flex-col p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                <h3 className="text-lg font-bold">엔터프라이즈 (Enterprise)</h3>
                <div className="mt-4 text-4xl font-bold">50,000원<span className="text-base font-normal text-gray-500">/월</span></div>
                <p className="text-sm text-gray-500">철저한 보안 관리용</p>
                <ul className="mt-6 space-y-4 flex-1">
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 다중 사용자 접근</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 전문 법률 상담</li>
                  <li className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> 우선 지원 서비스</li>
                </ul>
                <Button className="mt-8" variant="outline">문의하기</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BizGuard. All rights reserved. | 대표자: 김종환</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            서비스 이용약관
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy-policy">
            개인정보처리방침 (샘플)
          </Link>
        </nav>
      </footer>
    </div>
  )
}
