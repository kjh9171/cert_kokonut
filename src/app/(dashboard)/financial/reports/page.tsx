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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">재무 보고서 (Reports)</h2>
                <p className="text-slate-500 text-lg">월별 수입/지출 현황 및 상세 분석 리포트입니다.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-xl font-bold text-slate-800 text-center">상반기 요약 리포트</CardTitle>
                        <CardDescription className="text-center">2025년 1월 ~ 6월 트렌드</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] pt-8 px-6">
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
                                <Bar dataKey="수입" fill="#3b82f6" name="수입 (Income)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="지출" fill="#f43f5e" name="지출 (Expense)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                    <div className="bg-slate-50 p-6 flex justify-around border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-sm text-slate-500 mb-1">총 수입</p>
                            <p className="text-2xl font-bold text-blue-600">15,060,000원</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200 self-center" />
                        <div className="text-center">
                            <p className="text-sm text-slate-500 mb-1">총 지출</p>
                            <p className="text-2xl font-bold text-red-500">28,606,000원</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200 self-center" />
                        <div className="text-center">
                            <p className="text-sm text-slate-500 mb-1">순손익</p>
                            <p className="text-2xl font-bold text-slate-800">-13,546,000원</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
