"use client"

import { SecureVault } from "@/features/privacy/components/secure-vault"

export default function VaultPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">시큐어 볼트 (Secure Vault)</h2>
                <p className="text-slate-500 text-lg">
                    중요 계약서 및 고객 명단을 암호화하여 안전하게 보관하세요.
                </p>
            </div>
            <SecureVault />
        </div>
    )
}
