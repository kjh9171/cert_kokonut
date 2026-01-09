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
        <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                    <Wallet className="h-4 w-4 text-secondary" />
                    거래 내역 상세
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-xs font-black text-slate-500 py-3 pl-6 uppercase tracking-wider">일자</TableHead>
                            <TableHead className="text-xs font-black text-slate-500 uppercase tracking-wider">구분</TableHead>
                            <TableHead className="text-xs font-black text-slate-500 uppercase tracking-wider">카테고리</TableHead>
                            <TableHead className="text-xs font-black text-slate-500 uppercase tracking-wider">거래 내용</TableHead>
                            <TableHead className="text-right text-xs font-black text-slate-500 uppercase tracking-wider pr-6">금액 (₩)</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-slate-400 text-xs font-bold">
                                    등록된 거래 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedTransactions.map((t) => (
                                <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="py-3 pl-6 text-[12px] font-bold text-slate-500">
                                        {format(new Date(t.date), 'yyyy.MM.dd')}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${t.type === 'INCOME'
                                                ? 'bg-secondary/10 text-secondary border-secondary/20'
                                                : 'bg-primary/10 text-primary border-primary/20'
                                            }`}>
                                            {t.type === 'INCOME' ? '수입' : '지출'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-bold text-slate-700">
                                        {getCategoryName(t.categoryId)}
                                    </TableCell>
                                    <TableCell className="text-[12px] font-bold text-slate-900">
                                        {t.description}
                                    </TableCell>
                                    <TableCell className={`text-right font-black text-[14px] pr-6 ${t.type === 'INCOME' ? 'text-secondary' : 'text-primary'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTransaction(t.id)}
                                            className="h-8 w-8 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
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
    )
}
