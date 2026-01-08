"use client"

import { SecureVault } from "@/features/privacy/components/secure-vault"

export default function VaultPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Secure Vault</h3>
                <p className="text-sm text-muted-foreground">
                    Store sensitive contracts and customer lists securely.
                </p>
            </div>
            <SecureVault />
        </div>
    )
}
