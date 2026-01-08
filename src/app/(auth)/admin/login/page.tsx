"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, Lock } from "lucide-react"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuthStore()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const success = await login(email, password)
            if (success) {
                // Check pending user role
                const pending = useAuthStore.getState().pendingUser
                if (pending?.role !== 'PLATFORM_ADMIN') {
                    throw new Error("관리자 권한이 없습니다.")
                }

                // For Admin, skip OTP in this MVP or auto-verify
                useAuthStore.getState().verifyOtp("000000")

                router.push("/admin/dashboard")
            } else {
                throw new Error("이메일 또는 비밀번호가 잘못되었습니다.")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
            <Card className="w-full max-w-sm border-slate-700 bg-slate-800 text-slate-100">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-900/20 rounded-full ring-1 ring-red-500/50">
                            <ShieldCheck className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">관리자 로그인</CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        시스템 관리자 전용 접속 페이지입니다.<br />
                        일반 사용자는 접근할 수 없습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">관리자 ID (Email)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@bizguard.co.kr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-900 border-slate-700 focus:ring-red-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호 (Password)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-900 border-slate-700 focus:ring-red-500"
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-200">
                                <Lock className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button className="w-full bg-red-600 hover:bg-red-700" type="submit" disabled={isLoading}>
                            {isLoading ? "접속 중..." : "관리자 접속"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" className="text-slate-400 btn-sm" onClick={() => router.push("/login")}>
                        일반 사용자 로그인으로 이동
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
