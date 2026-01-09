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
        <div className="space-y-8 p-8 min-h-full">
            <header className="flex flex-col gap-2 mb-2 p-0 bg-transparent relative outline-none border-none">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">Financial Overview</span>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">금융 대시보드</h2>
                <p className="text-slate-500 text-base font-medium">안녕 하세요, <span className="text-blue-600 font-bold">{user?.adminName || '사용자'}</span>님! 실시간 재무 분석 결과입니다.</p>
            </header>

            {/* Excel Upload Section - Premium Glassmorphism style */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden group border-t border-slate-50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 py-6 px-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                데이터 인텔리전스 (Excel Import)
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium ml-13">정산 파일을 업로드하여 AI 기반 재무 분석을 시작하세요.</CardDescription>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        AI
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="relative rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-4 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50/30">
                        <ExcelUpload />
                    </div>
                </CardContent>
            </Card>

            {/* Summary Metrics - Premium Layout */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "총 잔액", value: balance, label: "현재 가용 자산", icon: DollarSign, color: "blue", trend: "+2.4%" },
                    { title: "총 수입", value: totalIncome, label: "이번 달 누적 수입", icon: TrendingUp, color: "emerald", trend: "+12.5%" },
                    { title: "총 지출", value: totalExpense, label: "이번 달 누적 지출", icon: TrendingDown, color: "rose", trend: "-3.2%" },
                ].map((item, idx) => (
                    <Card key={idx} className="border-none shadow-lg shadow-slate-200/40 bg-white rounded-3xl p-1 transition-transform hover:-translate-y-1 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                            <CardTitle className="text-sm font-bold text-slate-500 mb-0">
                                {item.title}
                            </CardTitle>
                            <div className={`h-11 w-11 rounded-2xl bg-${item.color}-50 flex items-center justify-center shadow-inner border border-${item.color}-100`}>
                                <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black text-slate-900 mb-1">₩{item.value.toLocaleString()}</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-${item.color}-50 text-${item.color}-600`}>{item.trend}</span>
                                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Projected Sales Card - Highlighted Premium */}
                <Card className="border-none shadow-xl shadow-blue-200/40 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="size-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6 relative z-10">
                        <CardTitle className="text-sm font-bold text-blue-100">
                            예상 매출 (Forecast)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 relative z-10">
                        <div className="text-3xl font-black mb-1">₩{(totalIncome * 1.1).toLocaleString()}</div>
                        <p className="text-xs text-blue-100/80 font-medium">지난달 대비 <span className="text-white font-bold">+10% 성장이 기대됩니다</span></p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Wide Premium Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] p-2">
                <div className="px-6 pt-6 pb-2">
                    <h3 className="text-xl font-bold text-slate-800">데이터 시각화</h3>
                    <p className="text-sm text-slate-400">카테고리별 지출 및 수입 트렌드 분석</p>
                </div>
                <CardContent className="p-4">
                    <DashboardCharts />
                </CardContent>
            </Card>
        </div>
    )
}
