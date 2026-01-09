"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users, FileText, Lock, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function PrivacyDashboard() {
    return (
        <div className="space-y-8 p-4 md:p-8 min-h-full bg-gradient-to-b from-background to-slate-50">
            <header className="flex flex-col gap-3 mb-2 p-0 bg-transparent">
                <div className="inline-flex items-center gap-2 w-fit">
                    <span className="px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">🔒 보안 & 컴플라이언스</span>
                </div>
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">개인정보 보호 현황</h1>
                    <p className="text-lg text-slate-600 font-medium">서비스 내 모든 데이터 처리 과정의 <span className="text-emerald-600 font-bold">보안 및 법적 준수 상태</span>를 확인하세요.</p>
                </div>
            </header>

            {/* Compliance Scores - Premium Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-2 border-blue-200 shadow-md bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-25 pb-3 px-5 pt-5 border-b border-blue-100">
                        <CardTitle className="text-sm font-bold text-blue-700 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            종합 준수율
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-4">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-4xl font-black text-blue-600">85%</span>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                <TrendingUp className="size-3" />
                                +5% pt
                            </div>
                        </div>
                        <Progress value={85} className="h-3 bg-slate-100 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-blue-500" />
                        <p className="text-xs text-slate-500 font-medium mt-3">지난달 대비 3.2% 개선됨</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-25 pb-3 px-5 pt-5 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            개인정보 보유량
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-4">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-4xl font-black text-slate-900">1,240건</span>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                <TrendingUp className="size-3" />
                                12.5% ↑
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">지난달: 1,100건 기준</p>
                    </CardContent>
                </Card>
                <Card className="border-2 border-rose-200 shadow-md bg-rose-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-rose-100 pb-3 px-5 pt-5 border-b border-rose-200">
                        <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            보안 취약점
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-4">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-4xl font-black text-rose-600">2건</span>
                            <span className="text-xs font-bold text-rose-700 bg-rose-200 px-2.5 py-1 rounded-full">긴급</span>
                        </div>
                        <p className="text-xs text-rose-600 font-medium">즉시 조치가 필요합니다 ⚠️</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Status Grid - Wide Premium */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-2 border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-25 px-6 pt-6 pb-4 border-b border-slate-100">
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-600" />
                            분야별 세부 보안 현황
                        </CardTitle>
                        <CardDescription className="text-slate-600 font-medium text-sm mt-1">주요 관리 항목별 정밀 진단 결과</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6 px-6 pb-6">
                        {[
                            { label: "개인정보 처리방침 최신성", status: "PASS", color: "emerald", desc: "✓ 법령 개정 사항 반영 완료" },
                            { label: "제3자 제공 동의 수집 현황", status: "CHECK", color: "amber", desc: "⚠ 일부 마케팅 동의 누락" },
                            { label: "접속 기록 관리 (Audit)", status: "PASS", color: "emerald", desc: "✓ 무결성 보장 및 보관 이행" },
                            { label: "개인정보 파기 주기 준수", status: "FAIL", color: "rose", desc: "✗ 보유 기간 경과 데이터 존재" },
                            { label: "관리자 2단계 인증 활성화", status: "PASS", color: "emerald", desc: "✓ 전체 관리자 설정 완료" },
                        ].map((item, idx) => {
                            const colorMap = {
                                emerald: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
                                amber: "border-amber-200 bg-amber-50 hover:bg-amber-100",
                                rose: "border-rose-200 bg-rose-50 hover:bg-rose-100",
                            }
                            const statusColorMap = {
                                PASS: "bg-emerald-100 text-emerald-700 border-emerald-200",
                                CHECK: "bg-amber-100 text-amber-700 border-amber-200",
                                FAIL: "bg-rose-100 text-rose-700 border-rose-200",
                            }
                            return (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border-2 ${colorMap[item.color as keyof typeof colorMap]} transition-all cursor-pointer`}>
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-slate-800">{item.label}</div>
                                        <div className="text-xs text-slate-600 font-medium">{item.desc}</div>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${statusColorMap[item.status as keyof typeof statusColorMap]} whitespace-nowrap ml-2`}>
                                        {item.status}
                                    </span>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-2 border-slate-800 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                        <Lock className="size-32" />
                    </div>
                    <CardHeader className="px-6 pt-6 pb-4 relative z-10">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            🔐 보안 이벤트 스트림
                        </CardTitle>
                        <CardDescription className="text-slate-300 font-medium text-sm">실시간 보안 및 감시 활동</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 px-6 pb-6 relative z-10 space-y-4">
                        {[
                            { user: "admin@kokonut.io", action: "처리방침 버전 업데이트", time: "2시간 전", icon: "📋" },
                            { user: "user01@company.com", action: "2단계 인증 신규 등록", time: "5시간 전", icon: "🔑" },
                            { user: "admin@kokonut.io", action: "제3자 제공 리스트 조회", time: "어제", icon: "👥" },
                            { user: "BIZGUARD AI", action: "비활성 계정 12건 격리", time: "어제", icon: "⚡" },
                        ].map((log, idx) => (
                            <div key={idx} className="flex gap-3 items-start group pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                                <div className="text-xl mt-0.5">{log.icon}</div>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex justify-between items-center w-full gap-2">
                                        <span className="text-xs font-bold text-slate-300 truncate">{log.user}</span>
                                        <span className="text-xs text-slate-500 font-medium shrink-0">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium leading-normal">{log.action}</p>
                                </div>
                            </div>
                        ))}
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 border-0 text-white rounded-lg py-5 font-bold text-sm transition-all">
                            전체 보안 로그 보기→
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
