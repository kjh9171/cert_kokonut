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
        <div className="space-y-6 p-6 bg-slate-50/50 min-h-full rounded-xl">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">금융 대시보드 (Financial Dashboard)</h2>
                <p className="text-slate-500 text-sm">안녕하세요, {user?.adminName || '사용자'}님! 오늘의 재무 현황입니다.</p>
            </div>

            {/* Excel Upload Section */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-blue-50/50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        데이터 가져오기 (Excel Import)
                    </CardTitle>
                    <CardDescription>엑셀 파일을 업로드하여 자동으로 장부를 분석하세요.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <ExcelUpload />
                </CardContent>
            </Card>

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            총 잔액 (Total Balance)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-slate-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₩{balance.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">현재 가용 자산</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            총 수입 (Total Income)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">₩{totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-emerald-500 mt-1">이번 달 누적 수입</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            총 지출 (Total Expenses)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-rose-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">₩{totalExpense.toLocaleString()}</div>
                        <p className="text-xs text-rose-500 mt-1">이번 달 누적 지출</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-blue-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-blue-100">
                            예상 매출 (Projected)
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₩{(totalIncome * 1.1).toLocaleString()}</div>
                        <p className="text-xs text-blue-200 mt-1">지난달 대비 +10% 예상</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <Card className="border-none shadow-sm bg-white p-6">
                <DashboardCharts />
            </Card>
        </div>
    )
}
