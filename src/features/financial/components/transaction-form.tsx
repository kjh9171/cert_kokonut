"use client"

import { useState } from "react"
import { useFinancialStore } from "@/store/financial-store"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export function TransactionForm() {
    const { categories, addTransaction } = useFinancialStore()
    const { user } = useAuthStore() // Get current user
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description || !categoryId || !user) return

        addTransaction({
            userId: user.id, // Attach User ID
            amount: parseFloat(amount),
            description,
            categoryId,
            type
        })

        // Reset form
        setAmount("")
        setDescription("")
    }

    const filteredCategories = categories.filter(c => c.type === type)

    return (
        <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <PlusCircle className="h-4 w-4 text-secondary" />
                    내역 입력
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setType('INCOME')}
                            className={`flex-1 rounded-md text-[11px] font-black transition-all h-8 ${type === 'INCOME' ? 'bg-secondary text-white hover:bg-secondary/90 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                            수입
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setType('EXPENSE')}
                            className={`flex-1 rounded-md text-[11px] font-black transition-all h-8 ${type === 'EXPENSE' ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <ArrowDownCircle className="mr-1.5 h-3.5 w-3.5" />
                            지출
                        </Button>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-[11px] font-black text-slate-500 uppercase tracking-wider">금액</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₩</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-7 rounded-lg border-slate-200 h-9 text-sm font-bold focus-visible:ring-secondary"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-[11px] font-black text-slate-500 uppercase tracking-wider">카테고리</Label>
                        <Select onValueChange={setCategoryId} value={categoryId}>
                            <SelectTrigger className="rounded-lg border-slate-200 h-9 text-xs font-bold focus:ring-secondary">
                                <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200">
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id} className="text-xs font-bold">{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-[11px] font-black text-slate-500 uppercase tracking-wider">적요</Label>
                        <Input
                            id="description"
                            placeholder="내용을 입력하세요"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="rounded-lg border-slate-200 h-9 text-sm font-bold focus-visible:ring-secondary"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-lg h-10 font-black text-xs shadow-sm mt-2">
                        기록 저장
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
    )
}
