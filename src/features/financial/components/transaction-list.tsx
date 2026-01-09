"use client"

import { useFinancialStore } from "@/store/financial-store"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, FileText, Tag, DollarSign, Wallet } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TransactionList() {
    const { transactions, categories, removeTransaction } = useFinancialStore()

    // Sort transactions by date (newest first)
    // Note: zustand persist hydrates dates as strings, so we need to handle that
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'

    return (
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    거래 내역
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/30">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-semibold text-slate-600 py-4"><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> 날짜</div></TableHead>
                            <TableHead className="font-semibold text-slate-600"><div className="flex items-center gap-2"><Tag className="h-4 w-4" /> 구분</div></TableHead>
                            <TableHead className="font-semibold text-slate-600">카테고리</TableHead>
                            <TableHead className="font-semibold text-slate-600"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> 내용</div></TableHead>
                            <TableHead className="text-right font-semibold text-slate-600"><div className="flex items-center justify-end gap-2"><DollarSign className="h-4 w-4" /> 금액</div></TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-40 text-slate-400">
                                    거래 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedTransactions.map((t) => (
                                <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="py-4 text-slate-600">
                                        {format(new Date(t.date), 'yyyy년 MM월 dd일')}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.type === 'INCOME' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                            {t.type === 'INCOME' ? '수입' : '지출'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-medium">
                                        {getCategoryName(t.categoryId)}
                                    </TableCell>
                                    <TableCell className="text-slate-800">
                                        {t.description}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold text-lg ${t.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}원
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTransaction(t.id)}
                                            className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
