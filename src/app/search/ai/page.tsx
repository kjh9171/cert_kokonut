"use client"

import { Bot, Sparkles, Send, Share2, ThumbsUp, MoreHorizontal, ShieldCheck } from "lucide-react"

export default function AISearchDemo() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* AI Query Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold text-slate-900">BizGuard ERP의 CSR(기업의 사회적 책임) 리포트에 대해 알려줘</h1>
                        <p className="text-sm text-slate-500">통합 보안 솔루션으로서의 사회적 가치와 경영 철학 분석</p>
                    </div>
                </div>

                {/* AI Answer Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>

                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Bot className="h-5 w-5" />
                        <span>AI 전문 분석가</span>
                    </div>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p>
                            BizGuard ERP의 CSR 활동은 단순히 기부를 넘어 **'기술을 통한 비즈니스 안전망 구축'**이라는 핵심 가치에 집중하고 있습니다. 최신 2024 CSR 리포트에 따르면 다음과 같은 3가지 핵심 성과를 달성했습니다.
                        </p>

                        <div className="grid gap-4">
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                <div className="p-2 bg-green-100 text-green-700 rounded-lg font-bold text-xs">ESG-1</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">중소기업 디지털 보안 상생 프로젝트</h4>
                                    <p className="text-sm text-slate-500">자금력이 부족한 초기 스타트업 500여 곳에 프리 에디션을 무상 보급하여 국내 IT 보안 생태계 강화에 기여했습니다.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs">ESG-2</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">개인정보 보호 기술 대중화</h4>
                                    <p className="text-sm text-slate-500">복잡한 보안 규정을 AI로 자동화하여 중소 영세 사업자의 컴플라이언스 비용을 평균 65% 절감시켰습니다.</p>
                                </div>
                            </div>
                        </div>

                        <p className="font-medium text-slate-900 italic">
                            "비즈가드는 보안이 기업의 특권이 아닌 기본 권리가 되는 세상을 지향합니다."
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                                <ThumbsUp className="h-4 w-4" /> 유익함
                            </button>
                            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                                <Share2 className="h-4 w-4" /> 공유
                            </button>
                        </div>
                        <button className="text-slate-300">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Search Bar Floating */}
                <div className="bg-white p-2 rounded-full border border-slate-200 shadow-2xl flex gap-2">
                    <input
                        type="text"
                        placeholder="추가로 궁금한 사항을 물어보세요..."
                        className="flex-1 h-12 px-6 outline-none text-slate-700 font-medium"
                    />
                    <button className="h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <footer className="mt-12 text-slate-400 text-xs font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Powered by BizGuard AI Engine
            </footer>
        </div>
    )
}
