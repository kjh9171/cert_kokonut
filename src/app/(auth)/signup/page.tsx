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
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
            <Card className="w-[450px] shadow-lg border-none">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-slate-900">회원가입 (Signup)</CardTitle>
                    <CardDescription>
                        {step === 1 ? "관리자 및 회사 정보를 입력해주세요." : "보안을 위해 Google OTP를 설정해주세요."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">이메일 (회사계정)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={formData.email}
                                        disabled={isEmailVerified}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1"
                                    />
                                    {!isEmailVerified && (
                                        <Button
                                            variant="outline"
                                            onClick={handleSendCode}
                                            disabled={isEmailSent && timer > 0}
                                            className="whitespace-nowrap"
                                        >
                                            {isEmailSent ? "재발송" : "인증요청"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEmailSent && !isEmailVerified && (
                                <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <Label className="text-blue-900 text-xs">인증번호 입력</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="6자리 숫자"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600">
                                                {formatTime(timer)}
                                            </span>
                                        </div>
                                        <Button onClick={handleVerifyEmail} className="bg-blue-600 hover:bg-blue-700">
                                            확인
                                        </Button>
                                    </div>
                                    {timer === 0 && <p className="text-xs text-rose-500">인증 시간이 만료되었습니다. 다시 시도해주세요.</p>}
                                </div>
                            )}

                            {isEmailVerified && (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-100 text-sm font-medium">
                                    <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                    이메일 인증이 완료되었습니다.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-700">비밀번호</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">관리자 이름</Label>
                                    <Input
                                        placeholder="홍길동"
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">회사명</Label>
                                    <Input
                                        placeholder="(주)Kokonut"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">사업자등록번호</Label>
                                <Input
                                    placeholder="000-00-00000"
                                    value={formData.bizId}
                                    onChange={(e) => setFormData({ ...formData, bizId: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

                            <Button
                                className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800 transition-all font-bold"
                                onClick={() => setStep(2)}
                                disabled={!isEmailVerified || !formData.password || !formData.companyName}
                            >
                                다음 단계로 (Next Step)
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-slate-600">
                                    Google Authenticator 앱으로 아래 QR 코드를 스캔하세요.
                                </p>
                            </div>

                            <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-inner">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                                ) : (
                                    <div className="w-48 h-48 animate-pulse bg-slate-100 rounded-lg" />
                                )}
                            </div>

                            <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Backup Secret Key</p>
                                <code className="text-sm text-slate-700 break-all font-mono">{secret}</code>
                            </div>

                            <Button className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={handleSignup}>
                                회원가입 완료 (Complete)
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col border-t bg-slate-50/50 p-6 rounded-b-xl gap-4">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        이미 계정이 있으신가요? 로그인
                    </button>
                </CardFooter>
            </Card>
        </div>
    )
}
