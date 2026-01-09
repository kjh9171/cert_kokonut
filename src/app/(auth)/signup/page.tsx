"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
    const router = useRouter()
    const { signup, generateOtpSecret, sendVerificationEmail, verifyEmail } = useAuthStore()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        adminName: "",
        companyName: "",
        bizId: ""
    })

    // Email Verification State
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [timer, setTimer] = useState(0)
    const [error, setError] = useState("")

    const [secret, setSecret] = useState("")
    const [qrUrl, setQrUrl] = useState("")

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    useEffect(() => {
        if (step === 2 && formData.email) {
            const newSecret = generateOtpSecret(formData.email)
            setSecret(newSecret)
            const otpauth = authenticator.keyuri(formData.email, 'SmartFinance', newSecret)
            QRCode.toDataURL(otpauth).then(setQrUrl)
        }
    }, [step])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleSendCode = () => {
        if (!formData.email.includes('@')) {
            setError("올바른 이메일 형식을 입력해주세요.")
            return
        }
        sendVerificationEmail(formData.email)
        setIsEmailSent(true)
        setTimer(180) // 3 mins
        setError("")
        alert("인증번호가 발송되었습니다. (Mock: 콘솔 확인)")
    }

    const handleVerifyEmail = () => {
        const success = verifyEmail(formData.email, verificationCode)
        if (success) {
            setIsEmailVerified(true)
            setTimer(0)
            setError("")
        } else {
            setError("인증번호가 올바르지 않거나 만료되었습니다.")
        }
    }

    const handleSignup = () => {
        signup({
            email: formData.email,
            passwordHash: formData.password,
            adminName: formData.adminName,
            companyName: formData.companyName,
            businessRegistrationNumber: formData.bizId,
            twoFactorSecret: secret
        })
        router.push('/login')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
            <Card className="w-full max-w-[500px] shadow-2xl border-2 border-blue-100 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-500 w-full" />
                <CardHeader className="pt-8 pb-6 px-8 bg-gradient-to-br from-white to-blue-50/30">
                    <CardTitle className="text-3xl font-black text-slate-900 mb-2">회원가입</CardTitle>
                    <CardDescription className="text-base text-slate-600 font-medium">
                        {step === 1 ? "📝 관리자 및 회사 정보를 입력해주세요." : "🔐 보안을 위해 OTP를 설정해주세요."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-800 font-bold text-sm">📧 이메일</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={formData.email}
                                        disabled={isEmailVerified}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1 h-12 border-2 border-slate-200 focus:border-blue-500 text-base font-medium"
                                    />
                                    {!isEmailVerified && (
                                        <Button
                                            variant="outline"
                                            onClick={handleSendCode}
                                            disabled={isEmailSent && timer > 0}
                                            className="h-12 px-4 font-bold border-2 hover:bg-blue-50"
                                        >
                                            {isEmailSent ? "재발송" : "인증요청"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEmailSent && !isEmailVerified && (
                                <div className="space-y-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <Label className="text-blue-900 font-bold text-sm">인증번호 입력</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="000000"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="h-12 border-2 border-blue-300 focus:border-blue-500 pr-12 text-base font-medium"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700 bg-white px-2 py-1 rounded">
                                                {formatTime(timer)}
                                            </span>
                                        </div>
                                        <Button onClick={handleVerifyEmail} className="h-12 px-6 bg-blue-600 hover:bg-blue-700 font-bold">
                                            확인
                                        </Button>
                                    </div>
                                    {timer === 0 && <p className="text-sm text-rose-700 font-semibold bg-rose-100 p-2 rounded">⚠️ 인증 시간이 만료되었습니다.</p>}
                                </div>
                            )}

                            {isEmailVerified && (
                                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 p-3 rounded-lg border-2 border-emerald-200 text-sm font-bold">
                                    <div className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">✓</div>
                                    ✓ 이메일 인증이 완료되었습니다.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-800 font-bold text-sm">🔐 비밀번호</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 text-base font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-slate-800 font-bold text-sm">👤 관리자 이름</Label>
                                    <Input
                                        placeholder="홍길동"
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        className="h-11 border-2 border-slate-200 focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-800 font-bold text-sm">🏢 회사명</Label>
                                    <Input
                                        placeholder="(주)Kokonut"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="h-11 border-2 border-slate-200 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-800 font-bold text-sm">📋 사업자등록번호</Label>
                                <Input
                                    placeholder="123-45-67890"
                                    value={formData.bizId}
                                    onChange={(e) => setFormData({ ...formData, bizId: e.target.value })}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 text-base font-medium"
                                />
                            </div>

                            {error && <div className="text-sm text-rose-700 bg-rose-100 p-3 rounded-lg border-2 border-rose-200 font-semibold">⚠️ {error}</div>}

                            <Button
                                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 transition-all font-bold shadow-lg"
                                onClick={() => setStep(2)}
                                disabled={!isEmailVerified || !formData.password || !formData.companyName}
                            >
                                다음 단계 →
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-base text-slate-700 font-semibold">
                                    🔐 Google Authenticator 앱으로<br/>
                                    아래 QR 코드를 스캔하세요.
                                </p>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-blue-50 to-white border-3 border-blue-200 rounded-2xl shadow-lg">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="QR Code" className="w-56 h-56" />
                                ) : (
                                    <div className="w-56 h-56 animate-pulse bg-slate-100 rounded-lg" />
                                )}
                            </div>

                            <div className="w-full p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                                <p className="text-xs text-slate-600 uppercase font-bold mb-2">🔑 백업 시크릿 키</p>
                                <code className="text-sm text-slate-900 break-all font-mono font-bold">{secret}</code>
                            </div>

                            <Button className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg" onClick={handleSignup}>
                                ✓ 회원가입 완료
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col border-t-2 border-slate-100 bg-gradient-to-r from-blue-50/50 to-slate-50/50 p-6 gap-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-base font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        이미 계정이 있으신가요? <span className="underline">로그인</span>
                    </button>
                </CardFooter>
            </Card>
        </div>
    )
}
