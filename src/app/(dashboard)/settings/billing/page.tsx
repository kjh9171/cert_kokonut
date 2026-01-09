"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, History, ShieldCheck, Zap, Star, Building } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BillingPage() {
    const [selectedPlan, setSelectedPlan] = useState("business")

    const plans = [
        {
            id: "free",
            name: "스타터 (Starter)",
            price: "₩0",
            period: "/월",
            description: "개인 및 초기 창업자를 위한 기본 보안 팩",
            features: ["재무 장부 10건/월", "시큐어 금고 1GB", "기본 정책 생성기", "이메일 지원"],
            icon: <Zap className="h-5 w-5 text-slate-400" />,
            color: "border-slate-200"
        },
        {
            id: "business",
            name: "비즈니스 (Business)",
            price: "₩49,000",
            period: "/월",
            description: "중소기업을 위한 최적화된 통합 솔루션",
            features: ["재무 장부 무제한", "시큐어 금고 100GB", "AI 정책 자동 고도화", "우선 기술 지원", "팀원 초대 최대 20명"],
            icon: <Star className="h-5 w-5 text-secondary" />,
            color: "border-secondary ring-2 ring-secondary/20",
            popular: true
        },
        {
            id: "enterprise",
            name: "엔터프라이즈 (Enterprise)",
            price: "별도문의",
            period: "",
            description: "대규모 조직 및 특수 보안 환경 맞춤형",
            features: ["모든 비즈니스 기능 포함", "무제한 시큐어 금고", "전담 보안 컨설턴트", "On-Premises 지원 가능", "SLA 보장"],
            icon: <Building className="h-5 w-5 text-primary" />,
            color: "border-primary"
        }
    ]

    const billingHistory = [
        { id: "INV-2026-001", date: "2026-01-09", amount: "₩49,000", status: "결제완료", method: "Mastercard (**** 8820)" },
        { id: "INV-2025-121", date: "2025-12-09", amount: "₩49,000", status: "결제완료", method: "Mastercard (**** 8820)" },
        { id: "INV-2025-112", date: "2025-11-09", amount: "₩49,000", status: "결제완료", method: "Mastercard (**** 8820)" },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6 pb-20 bg-[#F5F7FA] min-h-screen">
            <header className="flex flex-col gap-2 mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">결제 및 구독 관리</h1>
                <p className="text-sm text-slate-500 font-medium">유연한 요금제로 비즈니스 규모에 맞춰 서비스를 이용하세요.</p>
            </header>

            {/* Current Plan Badge */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                        <Star className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800">현재 이용 중인 플랜:</span>
                            <Badge variant="secondary" className="font-black">Business Plan</Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">다음 결제일: 2026년 2월 9일</p>
                    </div>
                </div>
                <Button variant="outline" className="text-xs font-black h-8 border-slate-200">구독 해지 예약</Button>
            </div>

            {/* Plan Selection Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${plan.color} ${selectedPlan === plan.id ? 'bg-white' : 'bg-slate-50/50 grayscale-[0.5] opacity-80'}`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                MOST POPULAR
                            </div>
                        )}
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                {plan.icon}
                                <CardTitle className="text-lg font-black text-slate-900">{plan.name}</CardTitle>
                            </div>
                            <CardDescription className="text-xs font-bold text-slate-500 min-h-[32px]">
                                {plan.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-sm text-slate-400 font-bold">{plan.period}</span>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className={`w-full font-black text-xs h-10 ${selectedPlan === plan.id ? 'bg-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}
                                disabled={selectedPlan === plan.id}
                            >
                                {selectedPlan === plan.id ? "현재 구독 중" : "플랜 선택하기"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
                {/* Payment Method */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                            <CreditCard className="h-4 w-4 text-primary" />
                            결제 수단 관리
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/30 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white font-black italic">
                                    VISA
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">Mastercard **** 8820</p>
                                    <p className="text-[10px] text-slate-400 font-bold">만료일: 12/28</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black hover:text-red-500 transition-colors">삭제</Button>
                        </div>
                        <Button variant="outline" className="w-full mt-6 border-dashed border-slate-300 h-12 text-slate-500 font-bold hover:border-primary hover:text-primary transition-all">
                            + 신규 결제 수단 추가
                        </Button>
                    </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                            <History className="h-4 w-4 text-slate-500" />
                            최근 결제 내역
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase h-10 px-6">일자</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase h-10">금액</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase h-10">상태</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase h-10 text-right px-6">영수증</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billingHistory.map((history) => (
                                    <TableRow key={history.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="text-[11px] font-bold text-slate-600 px-6">{history.date}</TableCell>
                                        <TableCell className="text-[11px] font-black text-slate-900">{history.amount}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-green-50 text-green-600 border-green-100 text-[9px] font-black py-0 h-5">
                                                {history.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100">
                                                <CreditCard className="h-3 w-3 text-slate-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold mt-12 bg-slate-100/50 py-3 rounded-lg border border-slate-200/50">
                <ShieldCheck className="h-3 w-3" />
                <span>모든 결제 정보는 SSL 암호화 기술을 통해 안전하게 처리되며 기업 보안 정책을 준수합니다.</span>
            </div>
        </div>
    )
}
