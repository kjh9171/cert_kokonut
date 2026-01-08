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
import { Trash2 } from "lucide-react"
import { format } from "date-fns"

export function TransactionList() {
    const { transactions, categories, removeTransaction } = useFinancialStore()

    // Sort transactions by date (newest first)
    // Note: zustand persist hydrates dates as strings, so we need to handle that
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No transactions yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedTransactions.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{format(new Date(t.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {t.type}
                                    </span>
                                </TableCell>
                                <TableCell>{getCategoryName(t.categoryId)}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className={`text-right font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTransaction(t.id)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
