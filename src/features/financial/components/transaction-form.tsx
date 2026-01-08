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
        <Card>
            <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant={type === 'INCOME' ? 'default' : 'outline'}
                            onClick={() => setType('INCOME')}
                            className="flex-1"
                        >
                            Income
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'EXPENSE' ? 'default' : 'outline'}
                            onClick={() => setType('EXPENSE')}
                            className="flex-1"
                        >
                            Expense
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

                    <Button type="submit" className="w-full">Add Transaction</Button>
                </form>
            </CardContent>
        </Card>
    )
}
