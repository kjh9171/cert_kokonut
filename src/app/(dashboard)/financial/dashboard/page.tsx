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
        <div className="space-y-8 p-4 md:p-8 min-h-full bg-gradient-to-b from-background to-slate-50">
            <header className="flex flex-col gap-3 mb-2 p-0 bg-transparent">
                <div className="inline-flex items-center gap-2 w-fit">
                    <span className="px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">💰 재무 분석</span>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">재무 대시보드</h1>
                        <p className="text-lg text-slate-600 font-medium">안녕하세요, <span className="text-blue-600 font-bold">{user?.adminName || '사용자'}</span>님! 👋</p>
                    </div>
                </div>
            </header>

            {/* Summary Metrics - Premium Layout */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "총 잔액", value: balance, label: "현재 가용 자산", icon: DollarSign, color: "blue", trend: "+2.4%" },
                    { title: "총 수입", value: totalIncome, label: "이번 달 누적 수입", icon: TrendingUp, color: "emerald", trend: "+12.5%" },
                    { title: "총 지출", value: totalExpense, label: "이번 달 누적 지출", icon: TrendingDown, color: "rose", trend: "-3.2%" },
                ].map((item, idx) => {
                    const colorMap = {
                        blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", light: "bg-blue-600" },
                        emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", light: "bg-emerald-600" },
                        rose: { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", light: "bg-rose-600" },
                    }
                    const c = colorMap[item.color as keyof typeof colorMap]
                    return (
                        <Card key={idx} className={`border-2 ${c.border} shadow-md hover:shadow-lg transition-all bg-white rounded-2xl overflow-hidden group cursor-pointer`}>
                            <CardHeader className={`${c.bg} flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5`}>
                                <CardTitle className="text-sm font-bold text-slate-600">
                                    {item.title}
                                </CardTitle>
                                <div className={`h-10 w-10 rounded-xl ${c.light} text-white flex items-center justify-center shadow-lg`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 pt-4">
                                <div className="text-3xl font-black text-slate-900 mb-2">₩{item.value.toLocaleString()}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{item.trend}</span>
                                    <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {/* Projected Sales Card - Highlighted Premium */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white rounded-2xl overflow-hidden relative col-span-full lg:col-span-1 group">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
                        <TrendingUp className="size-20" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5 relative z-10">
                        <CardTitle className="text-sm font-bold text-blue-100 uppercase tracking-wide">
                            예상 매출
                        </CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-3 relative z-10">
                        <div className="text-3xl font-black mb-2">₩{(totalIncome * 1.1).toLocaleString()}</div>
                        <p className="text-sm text-blue-100/90">지난달 대비 <span className="text-white font-bold">+10% 📈</span></p>
                    </CardContent>
                </Card>
            </div>

            {/* Excel Upload Section - Premium Card */}
            <Card className="border-2 border-blue-200 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-25 border-b border-blue-100 py-5 px-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                                <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-lg">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                데이터 분석 (Excel 업로드)
                            </CardTitle>
                            <CardDescription className="text-slate-600 font-medium text-sm">정산 파일을 업로드하여 AI 기반 재무 분석을 시작하세요.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition-all group-hover:border-blue-300 group-hover:bg-blue-50/30">
                        <ExcelUpload />
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section - Premium Card */}
            <Card className="border-2 border-slate-200 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <div className="px-6 pt-6 pb-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">📊 데이터 시각화</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">카테고리별 지출 및 수입 트렌드 분석</p>
                </div>
                <CardContent className="p-6">
                    <DashboardCharts />
                </CardContent>
            </Card>
        </div>
    )
}
