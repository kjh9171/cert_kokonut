"use client"

import { TransactionForm } from "@/features/financial/components/transaction-form"
import { TransactionList } from "@/features/financial/components/transaction-list"
import { Separator } from "@/components/ui/separator"

export default function LedgerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Ledger</h3>
                <p className="text-sm text-muted-foreground">
                    Record your income and expenses manually.
                </p>
            </div>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-2">
                    <TransactionForm />
                </div>
                <div className="lg:col-span-5">
                    <TransactionList />
                </div>
            </div>
        </div>
    )
}
