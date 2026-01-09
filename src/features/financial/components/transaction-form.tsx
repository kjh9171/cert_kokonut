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
    return (
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <PlusCircle className="h-5 w-5 text-blue-600" />
                    내역 추가
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3 bg-slate-100 p-1 rounded-xl">
                        <Button
                            type="button"
                            variant={type === 'INCOME' ? 'default' : 'ghost'}
                            onClick={() => setType('INCOME')}
                            className={`flex-1 rounded-lg transition-all ${type === 'INCOME' ? 'bg-white text-blue-600 shadow-sm hover:bg-white' : 'text-slate-500'}`}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            수입
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'EXPENSE' ? 'default' : 'ghost'}
                            onClick={() => setType('EXPENSE')}
                            className={`flex-1 rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm hover:bg-white' : 'text-slate-500'}`}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4" />
                            지출
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={setCategoryId} value={categoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="e.g. Lunch, Project A"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-lg shadow-blue-200">
                        기록하기
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
