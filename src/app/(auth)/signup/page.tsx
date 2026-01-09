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
import { ShieldCheck } from "lucide-react"

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
        <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA] p-4">
            <Card className="w-full max-w-[550px] shadow-xl border border-slate-200 rounded-lg overflow-hidden bg-white">
                <CardHeader className="pt-10 pb-6 px-10 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded bg-primary text-white">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="text-xl font-black tracking-tight">BizGuard <span className="text-secondary font-medium ml-1">ERP</span></span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">관리자 회원가입</CardTitle>
                    <CardDescription className="text-sm text-slate-500 font-medium">
                        {step === 1 ? "관리자 계정 및 기업 기본 정보를 입력해주세요." : "계정 보안을 위한 2단계 OTP 설정을 진행합니다."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10 bg-white space-y-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2 text-left">
                                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">이메일 계정</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="admin@company.com"
                                        value={formData.email}
                                        disabled={isEmailVerified}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1 h-11 border-slate-200 focus:border-secondary rounded-lg text-sm font-medium"
                                    />
                                    {!isEmailVerified && (
                                        <Button
                                            variant="outline"
                                            onClick={handleSendCode}
                                            disabled={isEmailSent && timer > 0}
                                            className="h-11 px-4 font-bold border-2 text-xs hover:bg-slate-50 border-slate-200"
                                        >
                                            {isEmailSent ? "인증번호 재발송" : "이메일 인증요청"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isEmailSent && !isEmailVerified && (
                                <div className="space-y-3 p-5 bg-slate-50 rounded-lg border border-slate-200">
                                    <Label className="text-slate-900 font-bold text-xs uppercase tracking-wider">인증번호 확인</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="000000"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="h-11 border-slate-300 focus:border-secondary pr-16 text-sm font-black tracking-widest"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary bg-white px-1.5 py-0.5 border border-slate-100 rounded">
                                                {formatTime(timer)}
                                            </span>
                                        </div>
                                        <Button onClick={handleVerifyEmail} className="h-11 px-6 bg-secondary hover:bg-secondary/90 font-bold text-xs">
                                            번호 확인
                                        </Button>
                                    </div>
                                    {timer === 0 && <p className="text-[11px] text-primary font-bold">⚠️ 인증 시간이 만료되었습니다. 다시 요청해주세요.</p>}
                                </div>
                            )}

                            {isEmailVerified && (
                                <div className="flex items-center gap-2 text-secondary bg-secondary/5 p-3 rounded-lg border border-secondary/20 text-xs font-bold">
                                    <ShieldCheck className="h-4 w-4" />
                                    이메일 인증이 성공적으로 완료되었습니다.
                                </div>
                            )}

                            <div className="space-y-2 text-left">
                                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">비밀번호 설정</Label>
                                <Input
                                    type="password"
                                    placeholder="8자 이상의 영문, 숫자 조합"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-11 border-slate-200 focus:border-secondary rounded-lg text-sm font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">관리자 성함</Label>
                                    <Input
                                        placeholder="홍길동"
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        className="h-11 border-slate-200 focus:border-secondary rounded-lg text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">회사명</Label>
                                    <Input
                                        placeholder="(주)비즈가드"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="h-11 border-slate-200 focus:border-secondary rounded-lg text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">사업자등록번호</Label>
                                <Input
                                    placeholder="123-45-67890"
                                    value={formData.bizId}
                                    onChange={(e) => setFormData({ ...formData, bizId: e.target.value })}
                                    className="h-11 border-slate-200 focus:border-secondary rounded-lg text-sm font-medium"
                                />
                            </div>

                            {error && <div className="text-xs text-primary bg-primary/5 p-3 rounded-lg border border-primary/20 font-bold">⚠️ {error}</div>}

                            <Button
                                className="w-full h-11 text-sm bg-primary hover:bg-primary/90 font-black shadow-md transition-all tracking-widest uppercase"
                                onClick={() => setStep(2)}
                                disabled={!isEmailVerified || !formData.password || !formData.companyName}
                            >
                                다음 단계 (OTP 설정)
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="text-center space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-200 w-full">
                                <p className="text-sm text-slate-900 font-black">
                                    Google Authenticator 설정
                                </p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    모바일 앱으로 아래 QR 코드를 스캔하여 계정을 등록하세요.
                                </p>
                            </div>

                            <div className="p-6 bg-white border-2 border-slate-100 rounded-xl shadow-inner">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="QR Code" className="w-52 h-52" />
                                ) : (
                                    <div className="w-52 h-52 animate-pulse bg-slate-100 rounded-lg" />
                                )}
                            </div>

                            <div className="w-full p-4 bg-slate-50 rounded-lg border border-slate-200 text-left">
                                <p className="text-[10px] text-slate-400 uppercase font-black mb-1.5 tracking-tighter">백업 시크릿 키 (보관 필수)</p>
                                <code className="text-[11px] text-slate-900 break-all font-mono font-bold">{secret}</code>
                            </div>

                            <div className="w-full space-y-3">
                                <Button className="w-full h-11 text-sm bg-secondary hover:bg-secondary/90 font-black shadow-md tracking-widest" onClick={handleSignup}>
                                    회원가입 및 등록 완료
                                </Button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors font-bold underline underline-offset-4"
                                >
                                    정보 수정으로 돌아가기
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col border-t border-slate-100 bg-slate-50/80 p-6">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs font-bold text-slate-500 hover:text-secondary transition-colors"
                    >
                        이미 관리자 계정이 있으신가요? <span className="underline underline-offset-4 ml-1">로그인 화면으로</span>
                    </button>
                </CardFooter>
            </Card>
        </div>
    )
}
