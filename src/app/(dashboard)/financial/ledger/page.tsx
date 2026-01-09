"use client"

import { TransactionForm } from "@/features/financial/components/transaction-form"
import { TransactionList } from "@/features/financial/components/transaction-list"
import { Separator } from "@/components/ui/separator"

export default function LedgerPage() {
    return (
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">재무 장부</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            정확한 수입과 지출 내역을 안전하게 기록하고 투명하게 관리하세요.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-7">
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
