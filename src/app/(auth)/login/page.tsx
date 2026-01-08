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
        // Mock validation: check if user exists (handled by store for prototype)
        // In real app, we might verify credentials on server first
        const isValid = login(email, password)
        if (isValid) {
            // If this is the test account, bypass OTP and sign in immediately
            const pending = useAuthStore.getState().pendingUser
            if (pending?.email === 'test@test.com') {
                useAuthStore.getState().verifyOtp('000000')
                router.push('/financial/dashboard')
                return
            }

            setStep(2)
            setError("")
        } else {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = verifyOtp(otpToken)
        if (success) {
            router.push("/financial/dashboard")
        } else {
            setError("인증 코드가 올바르지 않습니다.")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>로그인 (Login)</CardTitle>
                    <CardDescription>
                        서비스 이용을 위해 로그인해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>이메일</Label>
                                <Input
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>비밀번호</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFirstStep()}
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            <Button className="w-full" onClick={handleFirstStep}>
                                다음 (Next)
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="text-center text-sm text-muted-foreground">
                                Google OTP 앱의 6자리 코드를 입력하세요.
                            </div>
                            <div className="space-y-2">
                                <Label>OTP 코드</Label>
                                <Input
                                    className="text-center text-lg tracking-widest"
                                    maxLength={6}
                                    value={otpToken}
                                    onChange={(e) => setOtpToken(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp(e)}
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            <Button className="w-full" onClick={handleVerifyOtp}>
                                로그인 완료 (Verify)
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/signup" className="text-sm text-blue-500 hover:underline">
                        계정이 없으신가요? 회원가입
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
