"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users, FileText, Lock, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function PrivacyDashboard() {
    return (
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">개인정보 보호 현황</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">사내 개인정보 관리 체계 및 보안 컴플라이언스 준수 레포트입니다.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-xs font-bold border-slate-200 rounded-lg h-9">
                            보고서 다운로드
                        </Button>
                    </div>
                </div>
            </header>

            {/* Compliance Scores - ERP Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <CardTitle className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
                            <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                            종합 준수율
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-3xl font-black text-secondary">85.4%</span>
                            <div className="flex items-center gap-1 text-secondary font-black text-[10px] bg-secondary/10 px-2 py-0.5 rounded">
                                <TrendingUp className="size-3" />
                                +5.2%
                            </div>
                        </div>
                        <Progress value={85} className="h-2 bg-slate-100 rounded-full [&>div]:bg-secondary" />
                        <p className="text-[10px] text-slate-400 font-bold mt-3">정보보호 공시 기준 이행도 양호</p>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <CardTitle className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
                            <Users className="h-3.5 w-3.5 text-secondary" />
                            보유 데이터량
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-3xl font-black text-slate-900">1,240건</span>
                            <div className="text-[10px] font-black text-slate-400">전월 대비 12.5% 증가</div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">민감정보 240건 포함</p>
                    </CardContent>
                </Card>
                <Card className="border border-primary/30 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="pb-2 px-5 pt-5">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            위험 요소
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2">
                        <div className="flex items-end justify-between mb-4">
                            <span className="text-3xl font-black text-primary">02건</span>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">고위험</span>
                        </div>
                        <p className="text-[10px] text-primary font-bold">기술적 보호조치 미흡 사항 발견됨</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Status Grid - Wide ERP Layout */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="px-6 py-4 border-b border-slate-100">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-secondary" />
                            상세 진단 항목 리스트
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: "개인정보 처리방침 최신성", status: "적합", color: "blue", desc: "법령 개정 사항 반영 완료" },
                                { label: "제3자 제공 동의 수집 현황", status: "확인", color: "amber", desc: "일부 마케팅 동의 누락" },
                                { label: "접속 기록 관리 (Audit)", status: "적합", color: "blue", desc: "무결성 보장 및 보관 이행" },
                                { label: "개인정보 파기 주기 준수", status: "부적합", color: "red", desc: "보유 기간 경과 데이터 존재" },
                                { label: "관리자 2단계 인증 활성화", status: "적합", color: "blue", desc: "전체 관리자 설정 완료" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-bold text-slate-800">{item.label}</div>
                                        <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded border ${item.color === 'blue' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                        item.color === 'red' ? 'bg-primary/10 text-primary border-primary/20' :
                                            'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-secondary" />
                            최근 보안 로그
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {[
                                { user: "admin@kokonut.io", action: "처리방침 버전 업데이트", time: "2시간 전", icon: "📋" },
                                { user: "user01@company.com", action: "2단계 인증 신규 등록", time: "5시간 전", icon: "🔑" },
                                { user: "admin@kokonut.io", action: "제3자 제공 리스트 조회", time: "어제", icon: "👥" },
                                { user: "BIZGUARD AI", action: "비활성 계정 12건 격리", time: "어제", icon: "⚡" },
                            ].map((log, idx) => (
                                <div key={idx} className="flex gap-4 items-start group">
                                    <div className="text-xl shrink-0">{log.icon}</div>
                                    <div className="min-w-0 flex-1 border-b border-slate-50 pb-4 group-last:border-0 group-last:pb-0">
                                        <div className="flex justify-between items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-400 truncate">{log.user}</span>
                                            <span className="text-[10px] text-slate-300 font-bold">{log.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-bold leading-relaxed">{log.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-xs font-black text-secondary hover:bg-secondary/5 rounded-lg border border-secondary/20">
                            로그 상세 보기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
