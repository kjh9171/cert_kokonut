"use client"

import { Search, Globe, MoreVertical, Settings } from "lucide-react"

export default function GoogleSearchDemo() {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Google Search Header */}
            <div className="flex items-center p-6 gap-6 border-b border-slate-100">
                <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-7" />
                <div className="flex-1 max-w-2xl relative">
                    <input
                        type="text"
                        defaultValue="BizGuard ERP 이용약관"
                        className="w-full h-11 px-5 pr-12 rounded-full border border-slate-200 shadow-sm focus:shadow-md outline-none text-slate-700 text-sm"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <Settings className="h-5 w-5 text-slate-500" />
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">K</div>
                </div>
            </div>

            <main className="max-w-3xl ml-40 py-8 space-y-10">
                <p className="text-xs text-slate-500">검색결과 약 124,000개 (0.42초) </p>

                {/* Search Result 1 */}
                <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Globe className="h-4 w-4" />
                        </div>
                        <div className="text-[13px] text-slate-700">
                            <p>BizGuard &gt; Legal</p>
                            <p className="text-slate-400">https://cert-kokonut.com/terms</p>
                        </div>
                        <MoreVertical className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                    <h3 className="text-xl text-blue-800 hover:underline cursor-pointer font-medium mb-1">
                        BizGuard ERP 서비스 이용약관 - 통합 보안 솔루션
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        본 약관은 (주)비즈가드가 제공하는 BizGuard ERP 솔루션의 모든 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. 비즈가드는 귀하의 강력한 보안 파트너로서...
                    </p>
                </div>

                {/* Search Result 2 */}
                <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Globe className="h-4 w-4" />
                        </div>
                        <div className="text-[13px] text-slate-700">
                            <p>Tistory &gt; it-security</p>
                            <p className="text-slate-400">https://security-review.tistory.com/45</p>
                        </div>
                    </div>
                    <h3 className="text-xl text-blue-800 hover:underline cursor-pointer font-medium mb-1">
                        국내 ERP 솔루션 보안 비교: BizGuard vs 타사 약관 분석
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        2024년 12월 21일 — 오늘은 스마트 보안 ERP로 급부상 중인 BizGuard의 이용약관과 보안 정책을 분석해 보겠습니다. 다른 솔루션 대비 사용자 데이터 보호 조항이 매우 구체적이며...
                    </p>
                </div>
            </main>
        </div>
    )
}
