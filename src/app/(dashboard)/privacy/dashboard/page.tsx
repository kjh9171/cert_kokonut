"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users, FileText, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function PrivacyDashboard() {
    return (
        <div className="space-y-8 p-8 min-h-full">
            <header className="flex flex-col gap-2 mb-2 p-0 bg-transparent relative outline-none border-none">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Privacy & Compliance</span>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">개인정보 보호 현황</h2>
                <p className="text-slate-500 text-base font-medium">서비스 내 모든 데이터 처리 과정의 <span className="text-blue-600 font-bold">보안 및 법적 준수 상태</span>를 확인하세요.</p>
            </header>

            {/* Compliance Scores - Premium Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] p-1 overflow-hidden">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-sm font-bold text-slate-500">종합 준수율</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="flex items-end justify-between mb-3">
                            <span className="text-4xl font-black text-blue-600">85%</span>
                            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <TrendingUp className="size-3" />
                                +5% pt
                            </div>
                        </div>
                        <Progress value={85} className="h-3 bg-slate-100 overflow-hidden rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-blue-400" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] p-1">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-sm font-bold text-slate-500">개인정보 보유량</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-black text-slate-900">1,240건</div>
                            <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100">
                                <Users className="size-5 text-slate-400" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2">지난달 대비 <span className="text-emerald-500 font-bold">12.5% 증가</span></p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl shadow-rose-200/30 bg-rose-50 border border-rose-100 rounded-[2rem] p-1">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-rose-100 flex items-center justify-center">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                            보안 취약점 알림
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="text-3xl font-black text-rose-600">2건</div>
                        <p className="text-xs text-rose-500 font-medium mt-2">즉시 조치가 필요한 <span className="underline font-bold">중대 항목</span>이 발견되었습니다.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Status Grid - Wide Premium */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 border-none shadow-xl shadow-slate-200/40 bg-white rounded-[2rem] p-4">
                    <CardHeader className="px-4">
                        <CardTitle className="text-xl font-bold text-slate-800">분야별 세부 보안 현황</CardTitle>
                        <CardDescription className="text-slate-400 font-medium tracking-tight">주요 관리 항목별 정밀 진단 결과입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 px-4">
                        {[
                            { label: "개인정보 처리방침 최신성", status: "PASS", color: "emerald", desc: "법령 개정 사항 반영 완료" },
                            { label: "제3자 제공 동의 수집 현황", status: "CHECK", color: "amber", desc: "일부 마케팅 동의 누락" },
                            { label: "접속 기록 관리 (Audit)", status: "PASS", color: "emerald", desc: "무결성 보장 및 보관 이행" },
                            { label: "개인정보 파기 주기 준수", status: "FAIL", color: "rose", desc: "보유 기간 경과 데이터 존재" },
                            { label: "관리자 2단계 인증 활성화", status: "PASS", color: "emerald", desc: "전체 관리자 설정 완료" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-100`}>{item.status}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 border-none shadow-xl shadow-slate-200/40 bg-slate-900 rounded-[2rem] p-4 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Shield className="size-48" />
                    </div>
                    <CardHeader className="px-4 relative z-10">
                        <CardTitle className="text-xl font-bold">최근 보안 텔레메트리</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">실시간 보안 이벤트 스트림</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 px-4 relative z-10">
                        <div className="space-y-6">
                            {[
                                { user: "admin@kokonut.io", action: "처리방침 버전 업데이트", time: "2시간 전", type: "system" },
                                { user: "user01@company.com", action: "2단계 인증 신규 등록", time: "5시간 전", type: "security" },
                                { user: "admin@kokonut.io", action: "제3자 제공 리스트 조회", time: "어제", type: "audit" },
                                { user: "BIZGUARD AI", action: "비활성 계정 12건 격리", time: "어제", type: "ai" },
                            ].map((log, idx) => (
                                <div key={idx} className="flex gap-4 items-start group">
                                    <div className="size-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-150 transition-transform" />
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-[11px] font-bold text-slate-400 truncate">{log.user}</span>
                                            <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">{log.time}</span>
                                        </div>
                                        <p className="text-sm text-slate-200 font-medium leading-normal">{log.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl py-6 font-bold text-sm">
                            전체 보안 로그 보기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
