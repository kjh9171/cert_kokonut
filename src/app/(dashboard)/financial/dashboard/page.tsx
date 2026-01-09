"use client"

import { useFinancialStore } from "@/store/financial-store"
import { useAuthStore } from "@/store/auth-store"
import { DashboardCharts } from "@/features/financial/components/dashboard-charts"
import ExcelUpload from "@/features/financial/components/excel-upload"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react"

export default function FinancialDashboard() {
    const { transactions } = useFinancialStore()
    const { user } = useAuthStore()

    // Filter by Current User
    const userTransactions = transactions.filter(t => t.userId === user?.id)

    // Calculate Summary Metrics
    const totalIncome = userTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = userTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    return (
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">재무 대시보드</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            <span className="text-secondary font-bold">{user?.adminName || '사용자'}</span> 관리자님, 오늘의 재무 현황입니다.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                            2024년 5월 기준
                        </div>
                    </div>
                </div>
            </header>

            {/* Summary Metrics - ERP Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "총 잔액", value: balance, label: "현재 가용 자산", icon: DollarSign, color: "blue", trend: "+2.4%" },
                    { title: "총 수입", value: totalIncome, label: "이번 달 누적 수입", icon: TrendingUp, color: "blue", trend: "+12.5%" },
                    { title: "총 지출", value: totalExpense, label: "이번 달 누적 지출", icon: TrendingDown, color: "red", trend: "-3.2%" },
                ].map((item, idx) => {
                    const isRed = item.color === 'red';
                    return (
                        <Card key={idx} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {item.title}
                                </CardTitle>
                                <div className={`h-8 w-8 rounded-lg ${isRed ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} flex items-center justify-center`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 pt-2">
                                <div className={`text-2xl font-black ${isRed ? 'text-primary' : 'text-slate-900'}`}>
                                    ₩{item.value.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isRed ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                        {item.trend}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {/* Projected Sales Card - Functional Highlight */}
                <Card className="border border-secondary bg-secondary text-white rounded-lg overflow-hidden shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
                        <CardTitle className="text-xs font-bold text-white/80 uppercase tracking-wider">
                            예상 매출 (AI)
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-2">
                        <div className="text-2xl font-black">₩{(totalIncome * 1.1).toLocaleString()}</div>
                        <p className="text-[10px] text-white/70 font-bold mt-2">지난달 대비 <span className="text-white">약 10% 상승 예상</span></p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Excel Upload Section - Simplified ERP Card */}
                <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="border-b border-slate-100 py-4 px-6">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                            <CreditCard className="h-4 w-4 text-secondary" />
                            거래 내역 업로드
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 font-medium">Excel 파일을 드래그하여 정산을 시작하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                            <ExcelUpload />
                        </div>
                    </CardContent>
                </Card>

                {/* Charts Section - Clean White Card */}
                <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
                    <CardHeader className="border-b border-slate-100 py-4 px-6">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            재무 트렌드 분석
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 font-medium">월별 수입/지출 변화 추이</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <DashboardCharts />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
