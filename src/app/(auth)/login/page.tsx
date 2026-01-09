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
import { ShieldCheck } from "lucide-react"

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
        <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
            <Card className="w-[440px] shadow-xl border border-slate-200 rounded-lg overflow-hidden bg-white">
                <CardHeader className="pt-10 pb-6 px-10 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded bg-primary text-white">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-xl font-black tracking-tight">BizGuard <span className="text-secondary font-medium ml-1">ERP</span></span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">로그인</CardTitle>
                    <CardDescription className="text-sm text-slate-500 font-medium">
                        기업용 통합 보안 솔루션에 오신 것을 환영합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 py-8 space-y-6 bg-white">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">이메일 주소</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 border-slate-200 focus:border-secondary focus:ring-secondary rounded-lg text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">비밀번호</Label>
                                    <button className="text-[11px] font-bold text-secondary hover:underline">비밀번호 찾기</button>
                                </div>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFirstStep()}
                                    className="h-11 border-slate-200 focus:border-secondary focus:ring-secondary rounded-lg text-sm font-medium"
                                />
                            </div>
                            {error && (
                                <div className="text-xs text-primary bg-primary/5 p-3 rounded-lg border border-primary/20 font-bold flex items-center gap-2">
                                    <span className="text-base">⚠️</span> {error}
                                </div>
                            )}
                            <Button
                                className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg font-black text-sm shadow-md transition-all uppercase tracking-widest"
                                onClick={handleFirstStep}
                            >
                                로그인 하기
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-center space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-secondary text-white mb-2 shadow-md">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-slate-900 font-black">
                                    2단계 OTP 인증
                                </p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Google OTP 앱의 6자리 코드를 입력하세요.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    className="text-center text-3xl font-black tracking-[0.4em] h-14 border-2 border-slate-200 rounded-lg focus:border-secondary focus:ring-secondary bg-white placeholder-slate-200"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otpToken}
                                    onChange={(e) => setOtpToken(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp(e)}
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <div className="text-xs text-primary bg-primary/5 p-3 rounded-lg border border-primary/20 text-center font-bold">
                                    ⚠️ {error}
                                </div>
                            )}
                            <Button
                                className="w-full h-11 bg-secondary hover:bg-secondary/90 rounded-lg font-black text-sm shadow-md transition-all tracking-widest"
                                onClick={handleVerifyOtp}
                            >
                                OTP 인증 완료
                            </Button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-bold underline underline-offset-4"
                            >
                                이전 화면으로 이동
                            </button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center bg-slate-50/80 p-6 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500">
                        처음이신가요? <Link href="/signup" className="text-secondary hover:underline underline-offset-4 ml-1">관리자 계정 생성</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
