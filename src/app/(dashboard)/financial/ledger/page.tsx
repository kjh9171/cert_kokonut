"use client"

import { TransactionForm } from "@/features/financial/components/transaction-form"
import { TransactionList } from "@/features/financial/components/transaction-list"
import { Separator } from "@/components/ui/separator"

export default function LedgerPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">재무 장부 (Ledger)</h2>
                <p className="text-slate-500 text-lg">
                    수입과 지출 내역을 안전하게 기록하고 관리하세요.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
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
