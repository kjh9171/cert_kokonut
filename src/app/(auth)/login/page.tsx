"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { authenticator } from 'otplib'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const { login, isAuthenticated, verifyOtp } = useAuthStore()
    const [step, setStep] = useState(1) // 1: Creds, 2: OTP
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [otpToken, setOtpToken] = useState("")
    const [error, setError] = useState("")

    const handleFirstStep = () => {
        const isValid = login(email, password)
        if (isValid) {
            const pending = useAuthStore.getState().pendingUser

            // Bypass OTP for test account if needed (Optional, but keeping for convenience)
            if (pending?.email === 'test@test.com' && otpToken === '000000') {
                // handled in handleVerifyOtp usually, but here we check registration
            }

            if (pending?.twoFactorEnabled) {
                setStep(2)
                setError("")
            } else {
                router.push('/financial/dashboard')
            }
        } else {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        // Special bypass for test
        if (email === 'test@test.com' && otpToken === '000000') {
            useAuthStore.setState({ user: useAuthStore.getState().pendingUser, isAuthenticated: true, pendingUser: null })
            router.push("/financial/dashboard")
            return
        }

        const success = verifyOtp(otpToken)
        if (success) {
            router.push("/financial/dashboard")
        } else {
            setError("인증 코드가 올바르지 않습니다.")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
            <Card className="w-[420px] shadow-2xl border-2 border-blue-100 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-500 w-full" />
                <CardHeader className="pt-8 pb-6 px-8 bg-gradient-to-br from-white to-blue-50/30">
                    <CardTitle className="text-3xl font-black text-slate-900 mb-2">로그인</CardTitle>
                    <CardDescription className="text-base text-slate-600 font-medium">
                        BizGuard에 접속하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6 bg-white">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-800 font-bold text-sm block">📧 이메일</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base font-medium placeholder-slate-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-800 font-bold text-sm block">🔐 비밀번호</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFirstStep()}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base font-medium"
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-rose-700 bg-rose-100 p-3 rounded-lg border-2 border-rose-200 font-medium">
                                    ⚠️ {error}
                                </div>
                            )}
                            <Button
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                                onClick={handleFirstStep}
                            >
                                다음 단계 →
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-center space-y-3 bg-blue-50 p-6 rounded-xl border-2 border-blue-100">
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white mb-2 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </div>
                                <p className="text-base text-slate-700 font-semibold">
                                    🔐 2단계 인증
                                </p>
                                <p className="text-sm text-slate-600">
                                    Google OTP 앱에서<br />
                                    <span className="font-bold text-slate-900">6자리 인증 코드</span>를 입력하세요.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    className="text-center text-4xl font-black tracking-[0.3em] h-16 border-3 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-blue-500 bg-blue-50/50 placeholder-slate-300"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otpToken}
                                    onChange={(e) => setOtpToken(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp(e)}
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-rose-700 bg-rose-100 p-3 rounded-lg border-2 border-rose-200 text-center font-medium">
                                    ⚠️ {error}
                                </div>
                            )}
                            <Button
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                                onClick={handleVerifyOtp}
                            >
                                ✓ 인증 및 로그인
                            </Button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium underline"
                            >
                                ← 이전 단계로 돌아가기
                            </button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center bg-gradient-to-r from-blue-50/50 to-slate-50/50 p-6 border-t-2 border-slate-100">
                    <Link href="/signup" className="text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        계정이 없으신가요? <span className="underline">회원가입</span>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
