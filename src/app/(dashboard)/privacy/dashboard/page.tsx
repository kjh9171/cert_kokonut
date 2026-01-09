"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users, FileText, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function PrivacyDashboard() {
    return (
        <div className="space-y-6 p-6 bg-slate-50/50 min-h-full rounded-xl">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">개인정보 관리 현황</h2>
                <p className="text-slate-500 text-sm">회사 전체의 개인정보 보호 준수 상태를 한눈에 파악하세요.</p>
            </div>

            {/* Compliance Scores */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">종합 준수율</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-bold text-blue-600">85%</span>
                            <span className="text-xs text-emerald-500 font-medium">+5% point</span>
                        </div>
                        <Progress value={85} className="h-2 bg-slate-100" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">개인정보 보유량</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">1,240건</div>
                        <p className="text-xs text-slate-500 mt-1">지난달 대비 12% 증가</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-rose-50 border border-rose-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-1">
                            <ShieldAlert className="h-4 w-4" />
                            보안 취약점
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">2건</div>
                        <p className="text-xs text-rose-500 mt-1">즉시 조치가 필요한 항목</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Status Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">분야별 보안 현황</CardTitle>
                        <CardDescription>주요 관리 항목별 이행 상태입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "개인정보 처리방침 최신성", status: "PASS", color: "text-emerald-500" },
                            { label: "제3자 제공 동의 현황", status: "CHECK", color: "text-amber-500" },
                            { label: "접속 기록 관리 (로그 기록)", status: "PASS", color: "text-emerald-500" },
                            { label: "개인정보 파기 주기 준수", status: "FAIL", color: "text-rose-500" },
                            { label: "2단계 인증 활성화율", status: "PASS", color: "text-emerald-500" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">최근 활동 로그</CardTitle>
                        <CardDescription>사용자 및 관리자 작업 내역입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { user: "admin@kokonut.io", action: "개인정보 처리방침 수정", time: "2시간 전" },
                                { user: "user01@company.com", action: "2단계 인증 활성화", time: "5시간 전" },
                                { user: "admin@kokonut.io", action: "제3자 제공 동의 수집", time: "어제" },
                                { user: "system", action: "비활성 계정 자동 격리", time: "어제" },
                            ].map((log, idx) => (
                                <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-700">{log.user}</span>
                                        <span className="text-slate-400">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{log.action}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
