"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useFinancialStore } from "@/store/financial-store"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"

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
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">재무 보고서</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">월별 수입/지출 현황 및 상세 분석 리포트입니다.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-xs font-bold border-slate-200 rounded-lg h-9">
                            엑셀 내보내기
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                    <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-800">상반기 수입/지출 트렌드</CardTitle>
                            <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                2024.01 - 2024.06
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px] p-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 700 }} />
                                <Bar dataKey="수입" fill="hsl(var(--secondary))" name="수입" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="지출" fill="hsl(var(--primary))" name="지출" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                    <div className="bg-slate-50/50 p-6 grid grid-cols-3 gap-4 border-t border-slate-100">
                        <div className="text-center group">
                            <p className="text-[10px] text-slate-400 font-black mb-1">총 수입</p>
                            <p className="text-xl font-black text-secondary">15,060,000₩</p>
                        </div>
                        <div className="text-center group border-x border-slate-200">
                            <p className="text-[10px] text-slate-400 font-black mb-1">총 지출</p>
                            <p className="text-xl font-black text-primary">28,606,000₩</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-[10px] text-slate-400 font-black mb-1">순손익</p>
                            <p className="text-xl font-black text-slate-800">-13,546,000₩</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
