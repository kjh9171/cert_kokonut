"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, user, _hasHydrated } = useAuthStore()

    useEffect(() => {
        // Prevent redirect until store is hydrated
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/signup') // User requested redirect to Signup page for unauth access
        } else if (user?.status === 'SUSPENDED') {
            alert("관리자에 의해 계정이 정지되었습니다.")
            useAuthStore.getState().logout() // Logout if suspended
            router.push('/login')
        }
    }, [isAuthenticated, user, _hasHydrated, router])

    if (!_hasHydrated || !isAuthenticated) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div> // Or a loading spinner
    }

    return <>{children}</>
}
