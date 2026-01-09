"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, UserCheck, LayoutDashboard, Lock, CreditCard } from "lucide-react"

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            <header className="flex h-16 items-center px-4 lg:px-6 border-b border-slate-200 bg-white sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 font-bold text-lg">
                    <div className="p-2 rounded-lg bg-primary text-white shadow-md">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-slate-900 tracking-tight">BizGuard <span className="text-secondary font-medium ml-1">ERP</span></span>
                </Link>
            </header>

            <main className="container max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">체험판 신청 및 안내</h1>
                    <p className="text-lg text-slate-500 font-medium">실제 데이터와 동일한 환경에서 BizGuard ERP를 체험해 보세요.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <Card className="border-2 border-primary/20 shadow-xl rounded-xl overflow-hidden bg-white">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                            <div className="p-3 bg-primary text-white rounded-lg w-fit mb-4">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900">즉시 체험 계정</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">별도의 신청 절차 없이 바로 로그인 가능한 테스트 계정입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase">아이디(이메일)</span>
                                    <span className="text-sm font-bold text-slate-900">test@test.com</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase">비밀번호</span>
                                    <span className="text-sm font-bold text-slate-900">test1234</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase">OTP 인증코드</span>
                                    <span className="text-sm font-bold text-secondary">000000</span>
                                </div>
                            </div>
                            <Link href="/login" className="block">
                                <Button className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg">
                                    테스트 계정으로 로그인 <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                            <div className="p-3 bg-secondary/10 text-secondary rounded-lg h-fit">
                                <LayoutDashboard className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">통합 대시보드 체감</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">회사의 모든 지표를 한눈에 파악하는 고도화된 UI를 경험하세요.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                            <div className="p-3 bg-red-50 text-primary rounded-lg h-fit">
                                <Lock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">강력한 보안 기능</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">개인정보 암호화 저장 및 2단계 보안 인증 체계를 직접 확인하세요.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg h-fit">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">재무 및 자산 관리</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">복잡한 회계 지식이 없어도 누구나 관리 가능한 장부를 사용해 보세요.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-slate-900 rounded-2xl p-10 text-center text-white space-y-6 shadow-2xl">
                    <h2 className="text-2xl font-black">맞춤형 엔터프라이즈 체험이 필요하신가요?</h2>
                    <p className="text-slate-400 font-medium mx-auto max-w-lg">
                        귀사의 규모와 환경에 최적화된 맞춤형 데모 시스템 구축을 지원해 드립니다.
                        전담 컨설턴트가 상세히 안내해 드리겠습니다.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8">전담 컨설턴트 상담</Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold h-12 px-8">회사 소개서 받기</Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
