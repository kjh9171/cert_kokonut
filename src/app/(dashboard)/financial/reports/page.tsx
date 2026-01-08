"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useFinancialStore } from "@/store/financial-store"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ReportsPage() {
    const { transactions } = useFinancialStore()

    // In a real app, we would aggregate data by month here
    // For now, static mock data for visualization demonstration
    const data = [
        { name: '1월', 수입: 4000, 지출: 2400 },
        { name: '2월', 수입: 3000, 지출: 1398 },
        { name: '3월', 수입: 2000, 지출: 9800 },
        { name: '4월', 수입: 2780, 지출: 3908 },
        { name: '5월', 수입: 1890, 지출: 4800 },
        { name: '6월', 수입: 2390, 지출: 3800 },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">재무 보고서 (Reports)</h2>
                <p className="text-muted-foreground">월별 수입/지출 현황 및 상세 분석 리포트입니다.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>상반기 요약 리포트</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="수입" fill="#3b82f6" name="수입 (Income)" />
                                <Bar dataKey="지출" fill="#ef4444" name="지출 (Expense)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
