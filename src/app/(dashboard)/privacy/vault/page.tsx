"use client"

import { SecureVault } from "@/features/privacy/components/secure-vault"

export default function VaultPage() {
    return (
        <div className="space-y-6 p-6 min-h-full bg-[#F5F7FA]">
            <header className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">시큐어 볼트</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            중요 계약서 및 고객 명단을 암호화하여 안전하게 보관하세요.
                        </p>
                    </div>
                </div>
            </header>
            <SecureVault />
        </div>
    )
}
