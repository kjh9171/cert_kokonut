"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        } else if (user?.role !== 'PLATFORM_ADMIN') {
            router.push('/financial/dashboard') // Redirect non-admins
        }
    }, [isAuthenticated, user, router])

    if (!isAuthenticated || user?.role !== 'PLATFORM_ADMIN') {
        return null
    }

    return <>{children}</>
}
