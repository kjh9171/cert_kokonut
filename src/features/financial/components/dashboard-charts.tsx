"use client"

import * as React from "react"
import { useFinancialStore } from "@/store/financial-store"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DashboardCharts() {
    const { transactions, categories } = useFinancialStore()

    // Aggregate for Monthly Bar Chart (Last 30 days)
    // For simplicity in this demo, we just show "Daily" trend for the current month
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(today)

    // Create array of days for the current month
    const days = eachDayOfInterval({ start, end })

    const dailyData = days.map(day => {
        const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), day))
        const income = dayTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0)
        const expense = dayTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0)

        return {
            name: format(day, 'd'), // Day of month
            수입: income,
            지출: expense
        }
    })

    // Aggregate for Category Pie Chart (Expense only)
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    const categoryDataMap = expenseTransactions.reduce((acc, t) => {
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Unknown'
        acc[catName] = (acc[catName] || 0) + t.amount
        return acc
    }, {} as Record<string, number>)

    const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({
        name,
        value
    }))

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>현황 개요 (Overview)</CardTitle>
                    <CardDescription>이번 달 일별 수입 및 지출</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend />
                            <Bar dataKey="수입" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="지출" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>카테고리별 지출 (Spending by Category)</CardTitle>
                    <CardDescription>이번 달 지출 분포</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
